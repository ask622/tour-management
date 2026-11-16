import User from '../models/User.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

export const updateUser = async (req, res) => {
    try {
        const { username, email, photo } = req.body;
        const updates = {};

        if (username !== undefined) updates.username = username.trim();
        if (email !== undefined) updates.email = email.trim().toLowerCase();
        if (photo !== undefined) updates.photo = photo;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'Provide a username, email, or photo to update' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (err) {
        const status = err.name === 'ValidationError' || err.code === 11000 ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (String(req.user?.id) === req.params.id) {
            return res.status(409).json({ success: false, message: 'You cannot delete the administrator account you are currently using' });
        }

        const user = await User.findById(req.params.id).select('email role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(409).json({ success: false, message: 'Administrator accounts cannot be deleted from user management' });
        }

        const hasBookings = await Booking.exists({
            $or: [{ userId: String(user._id) }, { userEmail: user.email }],
        });
        if (hasBookings) {
            return res.status(409).json({ success: false, message: 'This user has booking history. Deactivate the account instead to preserve records.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        const status = err instanceof mongoose.Error.CastError ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? 'Invalid user ID' : 'Failed to delete user' });
    }
};

export const getSingleUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 100));
        const search = String(req.query.search || '').trim();
        const filter = {};
        if (search) {
            const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ username: expression }, { email: expression }];
        }
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        ]);
        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

export const updateUserStatus = async (req, res) => {
    if (typeof req.body.isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    if (String(req.user?.id) === req.params.id && req.body.isActive === false) {
        return res.status(409).json({ success: false, message: 'You cannot deactivate the administrator account you are currently using' });
    }

    try {
        const user = await User.findById(req.params.id).select('role');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin' && req.body.isActive === false) {
            return res.status(409).json({ success: false, message: 'Administrator accounts cannot be deactivated from user management' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.isActive },
            { new: true, runValidators: true }
        ).select('-password');
        if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({
            success: true,
            message: req.body.isActive ? 'User account activated' : 'User account deactivated',
            data: updatedUser,
        });
    } catch (err) {
        const status = err instanceof mongoose.Error.CastError ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? 'Invalid user ID' : 'Failed to update user status' });
    }
};

export const getUserBookings = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    try {
        const user = await User.findById(req.params.id).select('email');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const bookings = await Booking.find({
            $or: [{ userId: String(user._id) }, { userEmail: user.email }],
        })
            .select('fullName userEmail tourId guestSize bookAt totalAmount paymentStatus paymentVerified bookingStatus createdAt')
            .populate('tourId', 'title city')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to load user booking history' });
    }
};