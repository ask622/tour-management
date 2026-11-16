import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const unavailable = (res) => res.status(503).json({
  success: false,
  message: "Admin analytics require an active database connection",
});

export const getAdminOverview = async (req, res) => {
  if (!isDatabaseReady()) return unavailable(res);

  try {
    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const [
      totalTours,
      totalUsers,
      totalBookings,
      bookingStatuses,
      revenueResult,
      monthlyRevenueResult,
      recentBookings,
      recentUsers,
      popularTours,
    ] = await Promise.all([
      Tour.countDocuments(),
      User.countDocuments({ role: "user" }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { paymentVerified: true, paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            paymentVerified: true,
            paymentStatus: "completed",
            createdAt: { $gte: firstMonth },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Booking.find()
        .select("fullName userEmail tourId bookAt guestSize totalAmount bookingStatus paymentStatus paymentVerified createdAt")
        .populate("tourId", "title city")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      User.find({ role: "user" })
        .select("username email createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Booking.aggregate([
        { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
        { $group: { _id: "$tourId", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: Tour.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "tour",
          },
        },
        { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            bookings: 1,
            title: "$tour.title",
            city: "$tour.city",
          },
        },
      ]),
    ]);

    const statusCounts = bookingStatuses.reduce((counts, item) => {
      counts[item._id] = item.count;
      return counts;
    }, {});
    const revenueByMonth = new Map(
      monthlyRevenueResult.map((item) => [
        `${item._id.year}-${item._id.month}`,
        { revenue: item.revenue, bookings: item.bookings },
      ])
    );
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const values = revenueByMonth.get(key) || { revenue: 0, bookings: 0 };
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleString("en", { month: "short" }),
        ...values,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueResult[0]?.total || 0,
        totalBookings,
        totalTours,
        totalUsers,
        pendingBookings: statusCounts.pending || 0,
        confirmedBookings: statusCounts.confirmed || 0,
        cancelledBookings: statusCounts.cancelled || 0,
        completedBookings: statusCounts.completed || 0,
        recentBookings,
        recentUsers,
        monthlyRevenue,
        popularTours,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load admin overview" });
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAdminBookings = async (req, res) => {
  if (!isDatabaseReady()) return unavailable(res);

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = {};

  if (req.query.status) {
    if (!["pending", "confirmed", "cancelled", "completed"].includes(req.query.status)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }
    filter.bookingStatus = req.query.status;
  }

  if (req.query.tourId) {
    if (!mongoose.isValidObjectId(req.query.tourId)) {
      return res.status(400).json({ success: false, message: "Invalid tour ID" });
    }
    filter.tourId = req.query.tourId;
  }

  if (req.query.from || req.query.to) {
    const dateFilter = {};
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (Number.isNaN(from.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date" });
      }
      dateFilter.$gte = from;
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (Number.isNaN(to.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid end date" });
      }
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }
    filter.createdAt = dateFilter;
  }

  const search = String(req.query.search || "").trim();
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    const alternatives = [{ fullName: expression }, { userEmail: expression }];
    if (mongoose.isValidObjectId(search)) alternatives.push({ _id: search });
    filter.$or = alternatives;
  }

  try {
    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .select("fullName userEmail phone tourId guestSize bookAt paymentMethod totalAmount couponCode discountAmount paymentStatus paymentVerified bookingStatus adminNotes createdAt")
        .populate("tourId", "title city image")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};

export const updateAdminBooking = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid booking ID" });
  }
  if (Object.prototype.hasOwnProperty.call(req.body, "paymentStatus")) {
    return res.status(400).json({
      success: false,
      message: "Payment status can only change after a verified payment event",
    });
  }

  const updates = {};
  if (req.body.bookingStatus !== undefined) {
    if (!["pending", "confirmed", "cancelled", "completed"].includes(req.body.bookingStatus)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }
    updates.bookingStatus = req.body.bookingStatus;
  }
  if (req.body.adminNotes !== undefined) {
    if (typeof req.body.adminNotes !== "string" || req.body.adminNotes.length > 2000) {
      return res.status(400).json({ success: false, message: "Admin notes must be 2000 characters or fewer" });
    }
    updates.adminNotes = req.body.adminNotes.trim();
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "Provide a booking status or admin note to update" });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .select("fullName userEmail phone tourId guestSize bookAt paymentMethod totalAmount couponCode discountAmount paymentStatus paymentVerified bookingStatus adminNotes createdAt")
      .populate("tourId", "title city image")
      .lean();

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking updated successfully", data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};
