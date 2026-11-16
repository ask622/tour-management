import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthConstext";
import { BASE_URL } from "../utils/config";
import "./admin.css";

const emptyTour = {
  title: "",
  city: "",
  address: "",
  distance: "",
  image: "",
  description: "",
  price: "",
  discountPrice: "",
  maxPeople: "",
  duration: "",
  availableDates: [],
  itinerary: [],
  includedServices: [],
  excludedServices: [],
  gallery: [],
  status: "active",
  featured: false,
};

const parseLines = (value) => (Array.isArray(value) ? value : String(value || "").split(/\r?\n/))
  .map((item) => item.trim())
  .filter(Boolean);

const formatLines = (value, dateOnly = false) => (Array.isArray(value) ? value : [])
  .map((item) => {
    if (!dateOnly) return item;
    const date = new Date(item);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  })
  .filter(Boolean)
  .join("\n");

const emptyCategory = { name: "", slug: "", description: "", image: "", isActive: true };
const emptyDestination = { name: "", slug: "", country: "India", region: "", description: "", image: "", featured: false, isActive: true };
const emptyCoupon = { code: "", discountType: "percentage", discountValue: "", minOrderAmount: "0", maxDiscountAmount: "", startsAt: "", expiresAt: "", usageLimit: "0", isActive: true };
const contentSections = ["home", "about", "contact", "footer", "settings"];
const referenceId = (value) => (value && typeof value === "object" ? value._id || "" : value || "");
const toLocalDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const Admin = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [viewingUser, setViewingUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);
  const [userBookingsError, setUserBookingsError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [reviewFilters, setReviewFilters] = useState({ status: "pending", rating: "", tourId: "", search: "" });
  const [reviewStatusInput, setReviewStatusInput] = useState("pending");
  const [reviewRatingInput, setReviewRatingInput] = useState("");
  const [reviewTourInput, setReviewTourInput] = useState("");
  const [reviewSearchInput, setReviewSearchInput] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingPagination, setBookingPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [bookingFilters, setBookingFilters] = useState({ search: "", status: "", from: "", to: "" });
  const [bookingSearchInput, setBookingSearchInput] = useState("");
  const [bookingStatusInput, setBookingStatusInput] = useState("");
  const [bookingTourInput, setBookingTourInput] = useState("");
  const [bookingFromInput, setBookingFromInput] = useState("");
  const [bookingToInput, setBookingToInput] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [tourForm, setTourForm] = useState(null);
  const [catalogForm, setCatalogForm] = useState(null);
  const [couponForm, setCouponForm] = useState(null);
  const [contentRecords, setContentRecords] = useState({});
  const [contentKey, setContentKey] = useState("home");
  const [contentEditor, setContentEditor] = useState("{}");
  const [contentSaving, setContentSaving] = useState(false);
  const [contentError, setContentError] = useState("");
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryPagination, setEnquiryPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [enquiryFilters, setEnquiryFilters] = useState({ status: "", search: "" });
  const [enquiryStatusInput, setEnquiryStatusInput] = useState("");
  const [enquirySearchInput, setEnquirySearchInput] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [enquiryNotes, setEnquiryNotes] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Request failed");
    return result;
  }, []);

  const logout = async () => {
    try {
      await request("/api/v1/auth/logout", { method: "POST" });
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      dispatch({ type: "LOGOUT" });
      navigate("/admin/login");
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tourResult, userResult, categoryResult, destinationResult, couponResult, contentResult] = await Promise.all([
        request("/api/v1/tours/admin/all?page=1&limit=100"),
        request(`/api/v1/users?page=${userPagination.page}&limit=${userPagination.limit}&search=${encodeURIComponent(userSearch)}`),
        request("/api/v1/admin/categories"),
        request("/api/v1/admin/destinations"),
        request("/api/v1/admin/coupons"),
        request("/api/v1/admin/content"),
      ]);
      setTours(tourResult.data || []);
      setCategories(categoryResult.data || []);
      setDestinations(destinationResult.data || []);
      setCoupons(couponResult.data || []);
      setContentRecords(contentResult.data || {});
      setUsers(userResult.data || []);
      setUserPagination((current) => ({ ...current, ...(userResult.pagination || {}) }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [request, userPagination.limit, userPagination.page, userSearch]);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError("");
    try {
      const result = await request("/api/v1/admin/overview");
      setOverview(result.data);
    } catch (loadError) {
      setOverviewError(loadError.message);
    } finally {
      setOverviewLoading(false);
    }
  }, [request]);

  const loadBookings = useCallback(async () => {
    setBookingLoading(true);
    setBookingError("");
    const params = new URLSearchParams({
      page: String(bookingPagination.page),
      limit: "20",
    });
    Object.entries(bookingFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    try {
      const result = await request(`/api/v1/admin/bookings?${params.toString()}`);
      setBookings(result.data || []);
      setBookingPagination((current) => ({ ...current, ...result.pagination }));
    } catch (loadError) {
      setBookingError(loadError.message);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingFilters, bookingPagination.page, request]);

  const loadReviews = useCallback(async () => {
    setReviewLoading(true);
    setReviewError("");
    const params = new URLSearchParams({
      page: String(reviewPagination.page),
      limit: "20",
      ...reviewFilters,
    });
    Object.keys(reviewFilters).forEach((key) => {
      if (!reviewFilters[key]) params.delete(key);
    });
    try {
      const result = await request(`/api/v1/admin/reviews?${params.toString()}`);
      setReviews(result.data || []);
      setReviewPagination((current) => ({ ...current, ...result.pagination }));
    } catch (loadError) {
      setReviewError(loadError.message);
    } finally {
      setReviewLoading(false);
    }
  }, [request, reviewFilters, reviewPagination.page]);

  const loadEnquiries = useCallback(async () => {
    setEnquiryLoading(true);
    setEnquiryError("");
    const params = new URLSearchParams({ page: String(enquiryPagination.page), limit: "20" });
    Object.entries(enquiryFilters).forEach(([key, value]) => { if (value) params.set(key, value); });
    try {
      const result = await request(`/api/v1/admin/enquiries?${params.toString()}`);
      setEnquiries(result.data || []);
      setEnquiryPagination((current) => ({ ...current, ...result.pagination }));
    } catch (loadError) {
      setEnquiryError(loadError.message);
    } finally {
      setEnquiryLoading(false);
    }
  }, [enquiryFilters, enquiryPagination.page, request]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
      loadOverview();
    }
  }, [loadData, loadOverview, user]);

  useEffect(() => {
    setContentEditor(JSON.stringify(contentRecords[contentKey] || {}, null, 2));
  }, [contentKey, contentRecords]);

  useEffect(() => {
    if (user?.role === "admin" && section === "bookings") loadBookings();
  }, [bookingPagination.page, bookingFilters, loadBookings, section, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "reviews") loadReviews();
  }, [loadReviews, reviewPagination.page, reviewFilters, section, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "enquiries") loadEnquiries();
  }, [enquiryFilters, enquiryPagination.page, loadEnquiries, section, user]);

  const hasFallbackTours = tours.some((tour) => !/^[0-9a-f]{24}$/i.test(tour._id || ""));
  const maxMonthlyRevenue = useMemo(
    () => Math.max(1, ...(overview?.monthlyRevenue || []).map((month) => month.revenue)),
    [overview]
  );

  const saveTour = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const editing = Boolean(tourForm._id);
    const payload = {
      ...tourForm,
      distance: Number(tourForm.distance),
      price: Number(tourForm.price),
      discountPrice: tourForm.discountPrice === "" || tourForm.discountPrice === null ? null : Number(tourForm.discountPrice),
      maxPeople: Number(tourForm.maxPeople),
      availableDates: parseLines(tourForm.availableDates),
      itinerary: parseLines(tourForm.itinerary),
      includedServices: parseLines(tourForm.includedServices),
      excludedServices: parseLines(tourForm.excludedServices),
      gallery: parseLines(tourForm.gallery),
      categoryId: referenceId(tourForm.categoryId) || null,
      destinationId: referenceId(tourForm.destinationId) || null,
    };
    try {
      await request(
        editing ? `/api/v1/tours/${tourForm._id}` : "/api/v1/tours",
        { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }
      );
      setTourForm(null);
      setNotice(editing ? "Tour updated successfully." : "Tour created successfully.");
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveCatalogRecord = async (event) => {
    event.preventDefault();
    const type = catalogForm.type;
    const isDestination = type === "destination";
    const endpoint = isDestination ? "destinations" : "categories";
    const editing = Boolean(catalogForm._id);
    const payload = { ...catalogForm };
    delete payload.type;
    delete payload._id;
    setSaving(true);
    setError("");
    try {
      await request(
        `/api/v1/admin/${endpoint}${editing ? `/${catalogForm._id}` : ""}`,
        { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }
      );
      setCatalogForm(null);
      setNotice(`${isDestination ? "Destination" : "Category"} ${editing ? "updated" : "created"} successfully.`);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCatalogStatus = async (record, type) => {
    const endpoint = type === "destination" ? "destinations" : "categories";
    try {
      await request(`/api/v1/admin/${endpoint}/${record._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: record.isActive === false }),
      });
      setNotice(`${type === "destination" ? "Destination" : "Category"} status updated.`);
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const removeCatalogRecord = async (record, type) => {
    const endpoint = type === "destination" ? "destinations" : "categories";
    if (!window.confirm(`Delete "${record.name}"?`)) return;
    try {
      await request(`/api/v1/admin/${endpoint}/${record._id}`, { method: "DELETE" });
      setNotice(`${type === "destination" ? "Destination" : "Category"} deleted.`);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    const editing = Boolean(couponForm._id);
    const payload = {
      ...couponForm,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount || 0),
      maxDiscountAmount: couponForm.maxDiscountAmount === "" || couponForm.maxDiscountAmount === null ? null : Number(couponForm.maxDiscountAmount),
      usageLimit: Number(couponForm.usageLimit || 0),
    };
    delete payload._id;
    setSaving(true);
    setError("");
    try {
      await request(`/api/v1/admin/coupons${editing ? `/${couponForm._id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setCouponForm(null);
      setNotice(`Coupon ${editing ? "updated" : "created"} successfully.`);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await request(`/api/v1/admin/coupons/${coupon._id}`, { method: "DELETE" });
      setNotice("Coupon deleted.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const saveContent = async (event) => {
    event.preventDefault();
    setContentSaving(true);
    setContentError("");
    let data;
    try {
      data = JSON.parse(contentEditor);
    } catch (parseError) {
      setContentError("Content must be valid JSON.");
      setContentSaving(false);
      return;
    }
    try {
      const result = await request(`/api/v1/admin/content/${contentKey}`, {
        method: "PUT",
        body: JSON.stringify({ data }),
      });
      setContentRecords((current) => ({ ...current, [contentKey]: result.data }));
      setContentEditor(JSON.stringify(result.data, null, 2));
      setNotice(`${contentKey} website content saved.`);
    } catch (saveError) {
      setContentError(saveError.message);
    } finally {
      setContentSaving(false);
    }
  };

  const applyEnquiryFilters = (event) => {
    event.preventDefault();
    setEnquiryPagination((current) => ({ ...current, page: 1 }));
    setEnquiryFilters({ status: enquiryStatusInput, search: enquirySearchInput.trim() });
  };

  const updateEnquiry = async (enquiry, updates) => {
    setEnquiryError("");
    try {
      await request(`/api/v1/admin/enquiries/${enquiry._id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setNotice("Enquiry updated.");
      await loadEnquiries();
      return true;
    } catch (updateError) {
      setEnquiryError(updateError.message);
      return false;
    }
  };

  const openEnquiry = (enquiry) => {
    setEditingEnquiry(enquiry);
    setEnquiryNotes(enquiry.adminNotes || "");
    setEnquiryError("");
  };

  const saveEnquiryNotes = async (event) => {
    event.preventDefault();
    if (!editingEnquiry) return;
    setSaving(true);
    try {
      if (await updateEnquiry(editingEnquiry, { adminNotes: enquiryNotes })) setEditingEnquiry(null);
    } finally {
      setSaving(false);
    }
  };

  const removeEnquiry = async (enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}?`)) return;
    try {
      await request(`/api/v1/admin/enquiries/${enquiry._id}`, { method: "DELETE" });
      setNotice("Enquiry deleted.");
      await loadEnquiries();
    } catch (deleteError) {
      setEnquiryError(deleteError.message);
    }
  };

  const removeTour = async (tour) => {
    if (!window.confirm(`Delete "${tour.title}"? This cannot be undone.`)) return;
    setError("");
    try {
      await request(`/api/v1/tours/${tour._id}`, { method: "DELETE" });
      setNotice("Tour deleted successfully.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await request(`/api/v1/users/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          photo: editingUser.photo || "",
        }),
      });
      setEditingUser(null);
      setNotice("Person details updated successfully.");
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (person) => {
    const currentUserId = user?._id || user?.id;
    if (person._id === currentUserId) {
      setError("You cannot delete the administrator account you are currently using.");
      return;
    }
    if (!window.confirm(`Delete "${person.username}"? This cannot be undone.`)) return;

    setError("");
    try {
      await request(`/api/v1/users/${person._id}`, { method: "DELETE" });
      setNotice("Person deleted successfully.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const toggleUserStatus = async (person) => {
    try {
      await request(`/api/v1/users/${person._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !person.isActive }),
      });
      setNotice(person.isActive ? "Account deactivated. Existing sessions are now blocked." : "Account activated.");
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const openUserBookings = async (person) => {
    setViewingUser(person);
    setUserBookings([]);
    setUserBookingsError("");
    setUserBookingsLoading(true);
    try {
      const result = await request(`/api/v1/users/${person._id}/bookings`);
      setUserBookings(result.data || []);
    } catch (historyError) {
      setUserBookingsError(historyError.message);
    } finally {
      setUserBookingsLoading(false);
    }
  };

  const applyUserSearch = (event) => {
    event.preventDefault();
    setUserPagination((current) => ({ ...current, page: 1 }));
    setUserSearch(userSearchInput.trim());
  };

  const applyBookingFilters = (event) => {
    event.preventDefault();
    setBookingPagination((current) => ({ ...current, page: 1 }));
    setBookingFilters({
      search: bookingSearchInput.trim(),
      status: bookingStatusInput,
      tourId: bookingTourInput,
      from: bookingFromInput,
      to: bookingToInput,
    });
  };

  const applyReviewFilters = (event) => {
    event.preventDefault();
    setReviewPagination((current) => ({ ...current, page: 1 }));
    setReviewFilters({
      status: reviewStatusInput,
      rating: reviewRatingInput,
      tourId: reviewTourInput,
      search: reviewSearchInput.trim(),
    });
  };

  const moderateReview = async (review, updates) => {
    setReviewError("");
    try {
      await request(`/api/v1/admin/reviews/${review._id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setNotice("Review moderation updated.");
      await loadReviews();
    } catch (moderationError) {
      setReviewError(moderationError.message);
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setReviewError("");
    try {
      await request(`/api/v1/admin/reviews/${review._id}`, { method: "DELETE" });
      setNotice("Review deleted.");
      await loadReviews();
    } catch (deleteError) {
      setReviewError(deleteError.message);
    }
  };

  const updateBooking = async (booking, updates) => {
    setBookingSaving(true);
    setBookingError("");
    try {
      await request(`/api/v1/admin/bookings/${booking._id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setNotice("Booking updated successfully.");
      await Promise.all([loadBookings(), loadOverview()]);
      return true;
    } catch (updateError) {
      setBookingError(updateError.message);
      return false;
    } finally {
      setBookingSaving(false);
    }
  };

  const openBookingDetails = (booking) => {
    setEditingBooking(booking);
    setBookingNotes(booking.adminNotes || "");
  };

  const saveBookingNotes = async (event) => {
    event.preventDefault();
    if (!editingBooking) return;
    if (await updateBooking(editingBooking, { adminNotes: bookingNotes })) setEditingBooking(null);
  };

  if (!user || user.role !== "admin") {
    return (
      <main className="admin-access">
        <span className="admin-eyebrow">MEMBERS ONLY</span>
        <h1>Admin access required</h1>
        <p>Sign in with an administrator account to manage your tours and members.</p>
        <Link className="admin-primary-link" to="/admin/login">Administrator sign in</Link>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/home" className="admin-brand"><span>Y</span> Yatraventure</Link>
        <p className="admin-sidebar-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {[
            ["overview", "ri-layout-grid-line", "Overview"],
            ["tours", "ri-compass-3-line", "Tours"],
            ["people", "ri-group-line", "People"],
            ["bookings", "ri-calendar-check-line", "Bookings"],
            ["reviews", "ri-star-line", "Reviews"],
            ["categories", "ri-price-tag-3-line", "Categories"],
            ["destinations", "ri-map-pin-line", "Destinations"],
            ["coupons", "ri-coupon-3-line", "Coupons"],
            ["enquiries", "ri-mail-open-line", "Enquiries"],
            ["content", "ri-pages-line", "Website content"],
          ].map(([id, icon, label]) => (
            <button
              type="button"
              key={id}
              className={section === id ? "is-active" : ""}
              onClick={() => { setSection(id); setNotice(""); setError(""); }}
            >
              <i className={icon} aria-hidden="true" />{label}
              {id === "people" && <span className="admin-nav-count">{userPagination.total}</span>}
              {id === "bookings" && <span className="admin-nav-count">{overview?.totalBookings || 0}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-avatar">{(user.username || "A").slice(0, 1).toUpperCase()}</div>
          <div><strong>{user.username}</strong><small>Administrator</small></div>
          <Link to="/home" aria-label="Return to website"><i className="ri-external-link-line" /></Link>
          <button type="button" className="admin-logout-button" onClick={logout} aria-label="Log out" title="Log out"><i className="ri-logout-box-r-line" /></button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">OUTLAND / CONTROL ROOM</span>
            <h1>{section === "overview" ? "Good to see you." : section === "tours" ? "Your tours" : section === "people" ? "Your people" : section === "bookings" ? "Your bookings" : section === "reviews" ? "Review moderation" : section === "categories" ? "Tour categories" : section === "destinations" ? "Destinations" : section === "coupons" ? "Coupons" : section === "enquiries" ? "Customer enquiries" : "Website content & settings"}</h1>
          </div>
          <Link to="/home" className="admin-site-link"><i className="ri-arrow-left-line" /> View website</Link>
        </header>

        {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
        {notice && <div className="admin-alert admin-alert-success" role="status">{notice}</div>}

        {section === "overview" && (
          <>
            <div className="admin-welcome">
              <div><span>LIVE BUSINESS OVERVIEW</span><h2>Make room for the extraordinary.</h2><p>Bookings, tours and travelers—grounded in your database.</p></div>
              <i className="ri-compass-3-line" aria-hidden="true" />
            </div>
            {overviewError && <div className="admin-alert admin-alert-error" role="alert">{overviewError}</div>}
            {overviewLoading ? <p className="admin-empty">Loading live business data…</p> : overview && (
              <>
                <div className="admin-stat-grid admin-stat-grid-wide">
                  <article><span>Verified revenue</span><strong>₹{Number(overview.totalRevenue || 0).toLocaleString("en-IN")}</strong><small><i className="ri-shield-check-line" /> Verified payments only</small></article>
                  <article><span>Total bookings</span><strong>{overview.totalBookings}</strong><small><i className="ri-calendar-check-line" /> All booking records</small></article>
                  <article><span>Total tours</span><strong>{overview.totalTours}</strong><small><i className="ri-route-line" /> Database tours</small></article>
                  <article><span>Registered users</span><strong>{overview.totalUsers}</strong><small><i className="ri-user-heart-line" /> Customer accounts</small></article>
                </div>

                <div className="admin-booking-status-grid">
                  <article><span className="admin-status-dot pending" /> Pending <strong>{overview.pendingBookings}</strong></article>
                  <article><span className="admin-status-dot confirmed" /> Confirmed <strong>{overview.confirmedBookings}</strong></article>
                  <article><span className="admin-status-dot cancelled" /> Cancelled <strong>{overview.cancelledBookings}</strong></article>
                  <article><span className="admin-status-dot completed" /> Completed <strong>{overview.completedBookings}</strong></article>
                </div>

                <div className="admin-analytics-grid">
                  <div className="admin-panel admin-chart-panel">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">LAST 12 MONTHS</span><h2>Verified revenue</h2></div></div>
                    <div className="admin-revenue-chart" role="img" aria-label="Monthly verified revenue chart">
                      {(overview.monthlyRevenue || []).map((month) => (
                        <div className="admin-revenue-column" key={`${month.year}-${month.month}`} title={`${month.label}: ₹${Number(month.revenue).toLocaleString("en-IN")}`}>
                          <div className="admin-revenue-bar-wrap"><span style={{ height: `${Math.max(3, (month.revenue / maxMonthlyRevenue) * 100)}%` }} /></div>
                          <small>{month.label}</small>
                        </div>
                      ))}
                    </div>
                    <p className="admin-form-note">Only payments verified by a payment provider count as revenue. Current booking flow does not process online payments.</p>
                  </div>
                  <div className="admin-panel admin-popular-panel">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">CONFIRMED & COMPLETED</span><h2>Popular tours</h2></div></div>
                    {overview.popularTours?.length ? overview.popularTours.map((tour) => (
                      <div className="admin-popular-row" key={tour._id}>
                        <div><strong>{tour.title || "Tour removed"}</strong><small>{tour.city || "No destination"}</small></div>
                        <span>{tour.bookings} bookings</span>
                      </div>
                    )) : <p className="admin-empty">No confirmed bookings yet.</p>}
                  </div>
                </div>

                <div className="admin-analytics-grid admin-recent-grid">
                  <div className="admin-panel">
                    <div className="admin-panel-heading"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent bookings</h2></div><button type="button" className="admin-text-button" onClick={() => setSection("bookings")}>View all <i className="ri-arrow-right-line" /></button></div>
                    {overview.recentBookings?.length ? (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead><tr><th>TRAVELER</th><th>TOUR</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                          <tbody>{overview.recentBookings.map((booking) => (
                            <tr key={booking._id}>
                              <td>{booking.fullName}</td>
                              <td>{booking.tourId?.title || "Tour removed"}</td>
                              <td>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</td>
                              <td><span className="admin-badge">{booking.bookingStatus}</span></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : <p className="admin-empty">No bookings have been recorded.</p>}
                  </div>
                  <div className="admin-panel">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">LATEST SIGN-UPS</span><h2>Recent travelers</h2></div></div>
                    {overview.recentUsers?.length ? overview.recentUsers.map((person) => (
                      <div className="admin-recent-user" key={person._id}>
                        <span>{(person.username || "?").slice(0, 1).toUpperCase()}</span>
                        <div><strong>{person.username}</strong><small>{person.email}</small></div>
                        <time>{person.createdAt ? new Date(person.createdAt).toLocaleDateString() : "—"}</time>
                      </div>
                    )) : <p className="admin-empty">No registered travelers yet.</p>}
                  </div>
                </div>
              </>
            )}
            <div className="admin-section-heading"><div><span className="admin-eyebrow">QUICK ACTIONS</span><h2>Where to next?</h2></div></div>
            <div className="admin-quick-grid">
              <button type="button" onClick={() => { setSection("tours"); setTourForm({ ...emptyTour }); }}><i className="ri-add-line" /><strong>Create a tour</strong><span>Bring a new destination to life</span><i className="ri-arrow-right-line" /></button>
              <button type="button" onClick={() => setSection("people")}><i className="ri-team-line" /><strong>Meet your people</strong><span>View and update member details</span><i className="ri-arrow-right-line" /></button>
            </div>
          </>
        )}

        {section === "tours" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CURATE THE JOURNEY</span><h2>All tours <span>{tours.length}</span></h2></div>
              <button type="button" className="admin-primary-button" onClick={() => setTourForm({ ...emptyTour })}><i className="ri-add-line" /> New tour</button>
            </div>
            {hasFallbackTours && <div className="admin-alert admin-alert-error">Sample tours are read-only while the database is unavailable. Connect the database to manage tours.</div>}
            {loading ? <p className="admin-empty">Loading tours…</p> : tours.length === 0 ? <p className="admin-empty">No tours yet. Create your first journey.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-booking-table">
                  <thead><tr><th>JOURNEY</th><th>DESTINATION</th><th>PRICE</th><th>FEATURED</th><th>AVAILABILITY</th><th /></tr></thead>
                  <tbody>{tours.map((tour) => (
                    <tr key={tour._id}>
                      <td><div className="admin-tour-name">{(tour.photo || tour.image) && <img src={tour.photo || (tour.image?.startsWith("/") ? `${BASE_URL}${tour.image}` : tour.image)} alt="" />}<strong>{tour.title}</strong></div></td>
                      <td>{tour.city}</td>
                      <td>₹{Number(tour.price).toLocaleString("en-IN")}</td>
                      <td><span className={`admin-badge ${tour.featured ? "featured" : ""}`}>{tour.featured ? "Featured" : "Standard"}</span></td>
                      <td><span className={`admin-badge ${tour.status !== "inactive" ? "featured" : ""}`}>{tour.status === "inactive" ? "Inactive" : "Active"}</span></td>
                      <td className="admin-actions"><button type="button" aria-label={`Edit ${tour.title}`} disabled={!/^[0-9a-f]{24}$/i.test(tour._id || "")} onClick={() => setTourForm({ ...emptyTour, ...tour })}><i className="ri-edit-line" /></button><button type="button" aria-label={`Delete ${tour.title}`} disabled={!/^[0-9a-f]{24}$/i.test(tour._id || "")} onClick={() => removeTour(tour)}><i className="ri-delete-bin-line" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === "categories" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">ORGANIZE EXPERIENCES</span><h2>Categories <span>{categories.length}</span></h2></div>
              <button type="button" className="admin-primary-button" onClick={() => setCatalogForm({ type: "category", ...emptyCategory })}><i className="ri-add-line" /> New category</button>
            </div>
            {loading ? <p className="admin-empty">Loading categories…</p> : categories.length === 0 ? <p className="admin-empty">No categories yet. Add one, then assign tours to it.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>CATEGORY</th><th>SLUG</th><th>ASSIGNED TOURS</th><th>STATUS</th><th /></tr></thead>
                  <tbody>{categories.map((category) => (
                    <tr key={category._id}>
                      <td><div className="admin-catalog-name">{category.image && <img src={category.image} alt="" />}<strong>{category.name}</strong></div><small className="admin-booking-customer">{category.description}</small></td>
                      <td>{category.slug}</td>
                      <td>{tours.filter((tour) => referenceId(tour.categoryId) === category._id).length}</td>
                      <td><span className={`admin-badge ${category.isActive !== false ? "featured" : ""}`}>{category.isActive === false ? "Inactive" : "Active"}</span></td>
                      <td className="admin-actions">
                        <button type="button" aria-label={`Edit ${category.name}`} onClick={() => setCatalogForm({ ...category, type: "category" })}><i className="ri-edit-line" /></button>
                        <button type="button" aria-label={`${category.isActive === false ? "Activate" : "Deactivate"} ${category.name}`} onClick={() => toggleCatalogStatus(category, "category")}><i className={category.isActive === false ? "ri-toggle-line" : "ri-toggle-fill"} /></button>
                        <button type="button" aria-label={`Delete ${category.name}`} onClick={() => removeCatalogRecord(category, "category")}><i className="ri-delete-bin-line" /></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === "destinations" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CURATE PLACES</span><h2>Destinations <span>{destinations.length}</span></h2></div>
              <button type="button" className="admin-primary-button" onClick={() => setCatalogForm({ type: "destination", ...emptyDestination })}><i className="ri-add-line" /> New destination</button>
            </div>
            {loading ? <p className="admin-empty">Loading destinations…</p> : destinations.length === 0 ? <p className="admin-empty">No destinations yet. Create one and connect it to tours.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>DESTINATION</th><th>REGION</th><th>ASSIGNED TOURS</th><th>FEATURED</th><th>STATUS</th><th /></tr></thead>
                  <tbody>{destinations.map((destination) => (
                    <tr key={destination._id}>
                      <td><div className="admin-catalog-name">{destination.image && <img src={destination.image} alt="" />}<strong>{destination.name}</strong></div><small className="admin-booking-customer">{destination.country}</small></td>
                      <td>{destination.region || "—"}</td>
                      <td>{tours.filter((tour) => referenceId(tour.destinationId) === destination._id).length}</td>
                      <td><span className={`admin-badge ${destination.featured ? "featured" : ""}`}>{destination.featured ? "Featured" : "Standard"}</span></td>
                      <td><span className={`admin-badge ${destination.isActive !== false ? "featured" : ""}`}>{destination.isActive === false ? "Inactive" : "Active"}</span></td>
                      <td className="admin-actions">
                        <button type="button" aria-label={`Edit ${destination.name}`} onClick={() => setCatalogForm({ ...destination, type: "destination" })}><i className="ri-edit-line" /></button>
                        <button type="button" aria-label={`${destination.isActive === false ? "Activate" : "Deactivate"} ${destination.name}`} onClick={() => toggleCatalogStatus(destination, "destination")}><i className={destination.isActive === false ? "ri-toggle-line" : "ri-toggle-fill"} /></button>
                        <button type="button" aria-label={`Delete ${destination.name}`} onClick={() => removeCatalogRecord(destination, "destination")}><i className="ri-delete-bin-line" /></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === "coupons" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">PROMOTIONS</span><h2>Coupons <span>{coupons.length}</span></h2></div>
              <button type="button" className="admin-primary-button" onClick={() => setCouponForm({ ...emptyCoupon, startsAt: toLocalDateTime(Date.now()) })}><i className="ri-add-line" /> New coupon</button>
            </div>
            {loading ? <p className="admin-empty">Loading coupons…</p> : coupons.length === 0 ? <p className="admin-empty">No coupons configured.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>CODE</th><th>DISCOUNT</th><th>VALID THROUGH</th><th>USAGE</th><th>STATUS</th><th /></tr></thead>
                  <tbody>{coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td><strong className="admin-coupon-code">{coupon.code}</strong></td>
                      <td>{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`}<small className="admin-booking-customer">Min. ₹{Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")}</small></td>
                      <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString() : "—"}</td>
                      <td>{coupon.usedCount || 0} / {coupon.usageLimit || "∞"}</td>
                      <td><span className={`admin-badge ${coupon.isActive ? "featured" : ""}`}>{coupon.isActive ? "Active" : "Inactive"}</span></td>
                      <td className="admin-actions">
                        <button type="button" aria-label={`Edit ${coupon.code}`} onClick={() => setCouponForm({ ...coupon, startsAt: toLocalDateTime(coupon.startsAt), expiresAt: toLocalDateTime(coupon.expiresAt) })}><i className="ri-edit-line" /></button>
                        <button type="button" aria-label={`Delete ${coupon.code}`} onClick={() => removeCoupon(coupon)}><i className="ri-delete-bin-line" /></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === "enquiries" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CUSTOMER MESSAGES</span><h2>Enquiries <span>{enquiryPagination.total}</span></h2></div>
            </div>
            <form className="admin-enquiry-filters" onSubmit={applyEnquiryFilters}>
              <label>Search<input value={enquirySearchInput} onChange={(e) => setEnquirySearchInput(e.target.value)} placeholder="Name, email, subject or message" /></label>
              <label>Status<select value={enquiryStatusInput} onChange={(e) => setEnquiryStatusInput(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="replied">Replied</option><option value="resolved">Resolved</option></select></label>
              <button type="submit" className="admin-primary-button"><i className="ri-search-line" /> Search</button>
            </form>
            {enquiryError && <div className="admin-alert admin-alert-error" role="alert">{enquiryError}</div>}
            {enquiryLoading ? <p className="admin-empty">Loading enquiries…</p> : enquiries.length === 0 ? <p className="admin-empty">No enquiries match these filters.</p> : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table admin-enquiry-table">
                    <thead><tr><th>FROM</th><th>SUBJECT / MESSAGE</th><th>RECEIVED</th><th>STATUS</th><th /></tr></thead>
                    <tbody>{enquiries.map((enquiry) => (
                      <tr key={enquiry._id}>
                        <td><strong>{enquiry.name}</strong><small className="admin-booking-customer">{enquiry.email}<br />{enquiry.phone || "No phone"}</small></td>
                        <td><strong>{enquiry.subject}</strong><small className="admin-booking-customer admin-enquiry-preview">{enquiry.message}</small></td>
                        <td>{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : "—"}</td>
                        <td><select className="admin-booking-status-select" aria-label={`Update enquiry status for ${enquiry.name}`} value={enquiry.status} onChange={(event) => updateEnquiry(enquiry, { status: event.target.value })}><option value="pending">Pending</option><option value="replied">Replied</option><option value="resolved">Resolved</option></select></td>
                        <td className="admin-actions"><button type="button" aria-label={`View enquiry from ${enquiry.name}`} onClick={() => openEnquiry(enquiry)}><i className="ri-eye-line" /></button><button type="button" aria-label={`Delete enquiry from ${enquiry.name}`} onClick={() => removeEnquiry(enquiry)}><i className="ri-delete-bin-line" /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="admin-booking-pagination">
                  <span>Page {enquiryPagination.page} of {Math.max(1, enquiryPagination.totalPages)}</span>
                  <div>
                    <button type="button" className="admin-cancel-button" disabled={enquiryPagination.page <= 1 || enquiryLoading} onClick={() => setEnquiryPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                    <button type="button" className="admin-cancel-button" disabled={enquiryPagination.page >= enquiryPagination.totalPages || enquiryLoading} onClick={() => setEnquiryPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {section === "content" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CMS & SITE SETTINGS</span><h2>Manage public content</h2></div>
            </div>
            <label className="admin-content-section-select">Section
              <select value={contentKey} onChange={(event) => {
                const nextKey = event.target.value;
                setContentKey(nextKey);
                setContentEditor(JSON.stringify(contentRecords[nextKey] || {}, null, 2));
                setContentError("");
              }}>
                {contentSections.map((key) => <option value={key} key={key}>{key[0].toUpperCase() + key.slice(1)}</option>)}
              </select>
            </label>
            <div className="admin-content-help">
              <strong>Editable fields for {contentKey}:</strong>
              <span>{contentKey === "home" ? "heroHeading, heroDescription, heroImage, heroImageSecondary, promotionalBanner, featuredTourIds, featuredDestinationIds, testimonials" : contentKey === "about" ? "introduction, mission, vision, image, team" : contentKey === "contact" ? "email, phone, address, socialLinks" : contentKey === "footer" ? "description, socialLinks, usefulLinks" : "websiteName, logo, favicon, maintenanceMode"}</span>
            </div>
            {contentError && <div className="admin-alert admin-alert-error" role="alert">{contentError}</div>}
            <form onSubmit={saveContent}>
              <label className="admin-content-json-label">Content JSON<textarea className="admin-json-editor" rows="18" spellCheck="false" value={contentEditor} onChange={(event) => setContentEditor(event.target.value)} /></label>
              <p className="admin-form-note">The server validates fields before saving. Supported structured values include tour/destination ID lists, social link maps, useful links, testimonials, and team members. Do not put credentials or API secrets here.</p>
              <div className="admin-modal-actions"><button type="submit" className="admin-primary-button" disabled={contentSaving}>{contentSaving ? "Saving…" : "Save website content"}</button></div>
            </form>
          </div>
        )}

        {section === "bookings" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">REAL DATABASE RECORDS</span><h2>Bookings <span>{bookingPagination.total}</span></h2></div>
            </div>
            <form className="admin-booking-filters" onSubmit={applyBookingFilters}>
              <label>Search<input value={bookingSearchInput} onChange={(e) => setBookingSearchInput(e.target.value)} placeholder="Booking ID, customer or email" /></label>
              <label>Status<select value={bookingStatusInput} onChange={(e) => setBookingStatusInput(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label>
              <label>Tour<select value={bookingTourInput} onChange={(e) => setBookingTourInput(e.target.value)}><option value="">All tours</option>{tours.filter((tour) => /^[0-9a-f]{24}$/i.test(tour._id || "")).map((tour) => <option key={tour._id} value={tour._id}>{tour.title}</option>)}</select></label>
              <label>Booked from<input type="date" value={bookingFromInput} onChange={(e) => setBookingFromInput(e.target.value)} /></label>
              <label>Booked through<input type="date" value={bookingToInput} onChange={(e) => setBookingToInput(e.target.value)} /></label>
              <button type="submit" className="admin-primary-button"><i className="ri-search-line" /> Search</button>
            </form>

            {bookingError && <div className="admin-alert admin-alert-error" role="alert">{bookingError}</div>}
            {bookingLoading ? <p className="admin-empty">Loading bookings…</p> : bookings.length === 0 ? <p className="admin-empty">No bookings match these filters.</p> : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>BOOKING / TRAVELER</th><th>TOUR</th><th>TRAVEL DATE</th><th>AMOUNT</th><th>PAYMENT</th><th>BOOKING STATUS</th><th /></tr></thead>
                    <tbody>{bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td><strong className="admin-booking-id" title={booking._id}>{booking._id}</strong><small className="admin-booking-customer">{booking.fullName}<br />{booking.userEmail}</small></td>
                        <td>{booking.tourId?.title || "Tour removed"}<small className="admin-booking-customer">{booking.tourId?.city || ""}</small></td>
                        <td>{booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : "—"}<small className="admin-booking-customer">{booking.guestSize} traveler{booking.guestSize === 1 ? "" : "s"}</small></td>
                        <td>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</td>
                        <td><span className={`admin-badge ${booking.paymentVerified ? "featured" : ""}`}>{booking.paymentVerified && booking.paymentStatus === "completed" ? "Verified" : "Unverified"}</span><small className="admin-booking-customer">{booking.paymentMethod || "—"}</small></td>
                        <td>
                          <select
                            className="admin-booking-status-select"
                            aria-label={`Update booking status for ${booking.fullName}`}
                            value={booking.bookingStatus}
                            disabled={bookingSaving}
                            onChange={(e) => updateBooking(booking, { bookingStatus: e.target.value })}
                          >
                            <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="admin-actions"><button type="button" aria-label={`View booking ${booking._id}`} onClick={() => openBookingDetails(booking)}><i className="ri-eye-line" /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="admin-booking-pagination">
                  <span>Page {bookingPagination.page} of {Math.max(1, bookingPagination.totalPages)}</span>
                  <div>
                    <button type="button" className="admin-cancel-button" disabled={bookingPagination.page <= 1 || bookingLoading} onClick={() => setBookingPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                    <button type="button" className="admin-cancel-button" disabled={bookingPagination.page >= bookingPagination.totalPages || bookingLoading} onClick={() => setBookingPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
                  </div>
                </div>
              </>
            )}
            <p className="admin-form-note">Payment state is read-only and counts as revenue only after a provider verifies it. No payment gateway is connected currently.</p>
          </div>
        )}

        {section === "reviews" && (
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CUSTOMER FEEDBACK</span><h2>Reviews <span>{reviewPagination.total}</span></h2></div>
            </div>
            <form className="admin-review-filters" onSubmit={applyReviewFilters}>
              <label>Search<input value={reviewSearchInput} onChange={(e) => setReviewSearchInput(e.target.value)} placeholder="Reviewer or review text" /></label>
              <label>Moderation<select value={reviewStatusInput} onChange={(e) => setReviewStatusInput(e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="hidden">Hidden</option><option value="all">All reviews</option></select></label>
              <label>Rating<select value={reviewRatingInput} onChange={(e) => setReviewRatingInput(e.target.value)}><option value="">All ratings</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label>
              <label>Tour<select value={reviewTourInput} onChange={(e) => setReviewTourInput(e.target.value)}><option value="">All tours</option>{tours.filter((tour) => /^[0-9a-f]{24}$/i.test(tour._id || "")).map((tour) => <option key={tour._id} value={tour._id}>{tour.title}</option>)}</select></label>
              <button type="submit" className="admin-primary-button"><i className="ri-search-line" /> Search</button>
            </form>
            {reviewError && <div className="admin-alert admin-alert-error" role="alert">{reviewError}</div>}
            {reviewLoading ? <p className="admin-empty">Loading reviews…</p> : reviews.length === 0 ? <p className="admin-empty">No reviews match these filters.</p> : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table admin-review-table">
                    <thead><tr><th>REVIEWER</th><th>TOUR</th><th>RATING</th><th>REVIEW</th><th>STATUS</th><th /></tr></thead>
                    <tbody>{reviews.map((review) => (
                      <tr key={review._id}>
                        <td>{review.username}<small className="admin-booking-customer">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—"}</small></td>
                        <td>{review.productId?.title || "Tour removed"}<small className="admin-booking-customer">{review.productId?.city || ""}</small></td>
                        <td><span className="admin-review-rating">{review.rating} <i className="ri-star-fill" /></span></td>
                        <td className="admin-review-text">{review.reviewText}</td>
                        <td><span className={`admin-badge ${review.isApproved && !review.isHidden ? "featured" : ""}`}>{review.isHidden ? "Hidden" : review.isApproved ? "Approved" : "Pending"}</span></td>
                        <td className="admin-actions">
                          <button type="button" aria-label={`${review.isApproved ? "Reject" : "Approve"} review by ${review.username}`} title={review.isApproved ? "Reject review" : "Approve review"} onClick={() => moderateReview(review, { isApproved: !review.isApproved })}><i className={review.isApproved ? "ri-close-circle-line" : "ri-checkbox-circle-line"} /></button>
                          <button type="button" aria-label={`${review.isHidden ? "Show" : "Hide"} review by ${review.username}`} title={review.isHidden ? "Show review" : "Hide review"} onClick={() => moderateReview(review, { isHidden: !review.isHidden })}><i className={review.isHidden ? "ri-eye-line" : "ri-eye-off-line"} /></button>
                          <button type="button" aria-label={`Delete review by ${review.username}`} title="Delete review" onClick={() => removeReview(review)}><i className="ri-delete-bin-line" /></button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="admin-booking-pagination">
                  <span>Page {reviewPagination.page} of {Math.max(1, reviewPagination.totalPages)}</span>
                  <div>
                    <button type="button" className="admin-cancel-button" disabled={reviewPagination.page <= 1 || reviewLoading} onClick={() => setReviewPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                    <button type="button" className="admin-cancel-button" disabled={reviewPagination.page >= reviewPagination.totalPages || reviewLoading} onClick={() => setReviewPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {section === "people" && (
          <div className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">YOUR TRAVEL COMMUNITY</span><h2>People <span>{userPagination.total}</span></h2></div></div>
            <form className="admin-user-search" onSubmit={applyUserSearch}>
              <input aria-label="Search users" value={userSearchInput} onChange={(e) => setUserSearchInput(e.target.value)} placeholder="Search by name or email" />
              <button type="submit" className="admin-primary-button"><i className="ri-search-line" /> Search</button>
            </form>
            {loading ? <p className="admin-empty">Loading people…</p> : users.length === 0 ? <p className="admin-empty">No registered people match this search.</p> : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>PERSON</th><th>EMAIL</th><th>JOINED</th><th>ROLE</th><th>ACCOUNT</th><th /></tr></thead>
                    <tbody>{users.map((person) => (
                      <tr key={person._id}>
                        <td><div className="admin-person-name"><span>{(person.username || "?").slice(0, 1).toUpperCase()}</span><strong>{person.username}</strong></div></td>
                        <td>{person.email}</td>
                        <td>{person.createdAt ? new Date(person.createdAt).toLocaleDateString() : "—"}</td>
                        <td><span className={`admin-badge ${person.role === "admin" ? "featured" : ""}`}>{person.role || "user"}</span></td>
                        <td><span className={`admin-badge ${person.isActive !== false ? "featured" : ""}`}>{person.isActive === false ? "Inactive" : "Active"}</span></td>
                        <td className="admin-actions">
                          <button type="button" aria-label={`View booking history for ${person.username}`} title="Booking history" onClick={() => openUserBookings(person)}><i className="ri-file-list-3-line" /></button>
                          <button type="button" aria-label={`Edit ${person.username}`} title="Edit user" onClick={() => setEditingUser({ ...person })}><i className="ri-edit-line" /></button>
                          <button type="button" aria-label={`${person.isActive === false ? "Activate" : "Deactivate"} ${person.username}`} title={person.role === "admin" ? "Administrator status is managed separately" : person.isActive === false ? "Activate account" : "Deactivate account"} disabled={person.role === "admin"} onClick={() => toggleUserStatus(person)}><i className={person.isActive === false ? "ri-user-follow-line" : "ri-user-forbid-line"} /></button>
                          <button type="button" aria-label={`Delete ${person.username}`} title={person._id === (user._id || user.id) ? "You cannot delete the account you are using" : person.role === "admin" ? "Administrator accounts cannot be deleted here" : "Delete user (only if there are no bookings)"} disabled={person._id === (user._id || user.id) || person.role === "admin"} onClick={() => removeUser(person)}><i className="ri-delete-bin-line" /></button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="admin-booking-pagination">
                  <span>Page {userPagination.page} of {Math.max(1, userPagination.totalPages)}</span>
                  <div>
                    <button type="button" className="admin-cancel-button" disabled={userPagination.page <= 1 || loading} onClick={() => setUserPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                    <button type="button" className="admin-cancel-button" disabled={userPagination.page >= userPagination.totalPages || loading} onClick={() => setUserPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {catalogForm && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCatalogForm(null); }}>
          <form className="admin-modal" onSubmit={saveCatalogRecord}>
            <button type="button" className="admin-modal-close" onClick={() => setCatalogForm(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">{catalogForm.type === "destination" ? "PLACE MANAGEMENT" : "TOUR TAXONOMY"}</span>
            <h2>{catalogForm._id ? "Edit" : "Create"} {catalogForm.type}</h2>
            <div className="admin-form-grid">
              <label>Name<input required maxLength="120" value={catalogForm.name || ""} onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })} /></label>
              <label>Slug<input value={catalogForm.slug || ""} placeholder="Generated from name if empty" onChange={(e) => setCatalogForm({ ...catalogForm, slug: e.target.value })} /></label>
              {catalogForm.type === "destination" && <>
                <label>Country<input maxLength="100" value={catalogForm.country || ""} onChange={(e) => setCatalogForm({ ...catalogForm, country: e.target.value })} /></label>
                <label>Region<input maxLength="120" value={catalogForm.region || ""} onChange={(e) => setCatalogForm({ ...catalogForm, region: e.target.value })} /></label>
              </>}
              <label className="admin-form-wide">Image URL<input type="text" maxLength="2048" value={catalogForm.image || ""} onChange={(e) => setCatalogForm({ ...catalogForm, image: e.target.value })} placeholder="https://… or /api/v1/tour-images/…" /></label>
              <label className="admin-form-wide">Description<textarea rows="4" maxLength={catalogForm.type === "destination" ? 3000 : 2000} value={catalogForm.description || ""} onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })} /></label>
              <label className="admin-checkbox admin-form-wide"><input type="checkbox" checked={catalogForm.isActive !== false} onChange={(e) => setCatalogForm({ ...catalogForm, isActive: e.target.checked })} /> Active on the public website</label>
              {catalogForm.type === "destination" && <label className="admin-checkbox admin-form-wide"><input type="checkbox" checked={Boolean(catalogForm.featured)} onChange={(e) => setCatalogForm({ ...catalogForm, featured: e.target.checked })} /> Feature this destination</label>}
            </div>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setCatalogForm(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
          </form>
        </div>
      )}

      {couponForm && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCouponForm(null); }}>
          <form className="admin-modal" onSubmit={saveCoupon}>
            <button type="button" className="admin-modal-close" onClick={() => setCouponForm(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">PROMOTION RULES</span>
            <h2>{couponForm._id ? "Edit coupon" : "Create coupon"}</h2>
            <div className="admin-form-grid">
              <label>Coupon code<input required maxLength="40" value={couponForm.code || ""} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} /></label>
              <label>Discount type<select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount (INR)</option></select></label>
              <label>Discount value<input required type="number" min="0.01" step="0.01" max={couponForm.discountType === "percentage" ? "100" : undefined} value={couponForm.discountValue ?? ""} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} /></label>
              <label>Minimum order (₹)<input type="number" min="0" step="0.01" value={couponForm.minOrderAmount ?? "0"} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })} /></label>
              <label>Maximum discount (₹)<input type="number" min="0" step="0.01" value={couponForm.maxDiscountAmount ?? ""} onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })} /></label>
              <label>Usage limit (0 = unlimited)<input type="number" min="0" step="1" value={couponForm.usageLimit ?? "0"} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} /></label>
              <label>Starts at<input required type="datetime-local" value={couponForm.startsAt || ""} onChange={(e) => setCouponForm({ ...couponForm, startsAt: e.target.value })} /></label>
              <label>Expires at<input required type="datetime-local" value={couponForm.expiresAt || ""} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })} /></label>
              <label className="admin-checkbox admin-form-wide"><input type="checkbox" checked={Boolean(couponForm.isActive)} onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })} /> Coupon is active</label>
            </div>
            <p className="admin-form-note">Coupon discounts apply to tour subtotal before the reservation service fee. Usage limits are enforced on the server when a booking is created.</p>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setCouponForm(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save coupon"}</button></div>
          </form>
        </div>
      )}

      {tourForm && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTourForm(null); }}>
          <form className="admin-modal" onSubmit={saveTour}>
            <button type="button" className="admin-modal-close" onClick={() => setTourForm(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">{tourForm._id ? "REFINE THE EXPERIENCE" : "ADD A NEW EXPERIENCE"}</span>
            <h2>{tourForm._id ? "Edit tour" : "Create a tour"}</h2>
            <div className="admin-form-grid">
              <label>Tour title<input required value={tourForm.title || ""} onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })} /></label>
              <label>City / destination<input required value={tourForm.city || ""} onChange={(e) => setTourForm({ ...tourForm, city: e.target.value })} /></label>
              <label>Category<select value={referenceId(tourForm.categoryId)} onChange={(e) => setTourForm({ ...tourForm, categoryId: e.target.value })}><option value="">No category</option>{categories.filter((item) => item.isActive !== false || item._id === referenceId(tourForm.categoryId)).map((item) => <option key={item._id} value={item._id}>{item.name}{item.isActive === false ? " (inactive)" : ""}</option>)}</select></label>
              <label>Destination<select value={referenceId(tourForm.destinationId)} onChange={(e) => setTourForm({ ...tourForm, destinationId: e.target.value })}><option value="">No destination record</option>{destinations.filter((item) => item.isActive !== false || item._id === referenceId(tourForm.destinationId)).map((item) => <option key={item._id} value={item._id}>{item.name}{item.isActive === false ? " (inactive)" : ""}</option>)}</select></label>
              <label>Address<input required value={tourForm.address || ""} onChange={(e) => setTourForm({ ...tourForm, address: e.target.value })} /></label>
              <label>Distance (km)<input required type="number" min="0" value={tourForm.distance ?? ""} onChange={(e) => setTourForm({ ...tourForm, distance: e.target.value })} /></label>
              <label>Price (₹)<input required type="number" min="0" value={tourForm.price ?? ""} onChange={(e) => setTourForm({ ...tourForm, price: e.target.value })} /></label>
              <label>Discount price (₹)<input type="number" min="0" value={tourForm.discountPrice ?? ""} onChange={(e) => setTourForm({ ...tourForm, discountPrice: e.target.value })} /></label>
              <label>Maximum people<input required type="number" min="1" value={tourForm.maxPeople ?? ""} onChange={(e) => setTourForm({ ...tourForm, maxPeople: e.target.value })} /></label>
              <label>Duration<input maxLength="120" value={tourForm.duration || ""} placeholder="e.g. 3 days / 2 nights" onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })} /></label>
              <label>Status<select value={tourForm.status || "active"} onChange={(e) => setTourForm({ ...tourForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <label className="admin-form-wide">Available dates<textarea rows="3" value={formatLines(tourForm.availableDates, true)} placeholder="One YYYY-MM-DD date per line; leave blank for open availability" onChange={(e) => setTourForm({ ...tourForm, availableDates: e.target.value })} /></label>
              <label className="admin-form-wide">Image URL<input required type="text" value={tourForm.image || ""} placeholder="/api/v1/tour-images/tour.jpg or https://…" onChange={(e) => setTourForm({ ...tourForm, image: e.target.value })} /></label>
              <label className="admin-form-wide">Additional image URLs<textarea rows="3" value={formatLines(tourForm.gallery)} placeholder="One image URL per line" onChange={(e) => setTourForm({ ...tourForm, gallery: e.target.value })} /></label>
              <label className="admin-form-wide">Description<textarea required rows="4" value={tourForm.description || ""} onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })} /></label>
              <label className="admin-form-wide">Itinerary<textarea rows="4" value={formatLines(tourForm.itinerary)} placeholder="One itinerary item per line" onChange={(e) => setTourForm({ ...tourForm, itinerary: e.target.value })} /></label>
              <label>Included services<textarea rows="3" value={formatLines(tourForm.includedServices)} placeholder="One service per line" onChange={(e) => setTourForm({ ...tourForm, includedServices: e.target.value })} /></label>
              <label>Excluded services<textarea rows="3" value={formatLines(tourForm.excludedServices)} placeholder="One service per line" onChange={(e) => setTourForm({ ...tourForm, excludedServices: e.target.value })} /></label>
              <label className="admin-checkbox admin-form-wide"><input type="checkbox" checked={Boolean(tourForm.featured)} onChange={(e) => setTourForm({ ...tourForm, featured: e.target.checked })} /> Feature this tour on the website</label>
            </div>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setTourForm(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save tour"}</button></div>
          </form>
        </div>
      )}

      {editingBooking && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingBooking(null); }}>
          <form className="admin-modal admin-booking-modal" onSubmit={saveBookingNotes}>
            <button type="button" className="admin-modal-close" onClick={() => setEditingBooking(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">BOOKING #{editingBooking._id.slice(-8).toUpperCase()}</span>
            <h2>Booking details</h2>
            <div className="admin-booking-detail-grid">
              <div><small>Traveler</small><strong>{editingBooking.fullName}</strong></div>
              <div><small>Email</small><strong>{editingBooking.userEmail}</strong></div>
              <div><small>Phone</small><strong>{editingBooking.phone}</strong></div>
              <div><small>Tour</small><strong>{editingBooking.tourId?.title || "Tour removed"}</strong></div>
              <div><small>Travel date</small><strong>{editingBooking.bookAt ? new Date(editingBooking.bookAt).toLocaleDateString() : "—"}</strong></div>
              <div><small>Travelers / total</small><strong>{editingBooking.guestSize} / ₹{Number(editingBooking.totalAmount).toLocaleString("en-IN")}</strong></div>
              <div><small>Coupon / discount</small><strong>{editingBooking.couponCode || "None"}{editingBooking.discountAmount > 0 ? ` / ₹${Number(editingBooking.discountAmount).toLocaleString("en-IN")}` : ""}</strong></div>
              <div><small>Payment</small><strong>{editingBooking.paymentVerified && editingBooking.paymentStatus === "completed" ? "Verified" : "Not verified"}</strong></div>
              <div><small>Payment method</small><strong>{editingBooking.paymentMethod || "—"}</strong></div>
            </div>
            {bookingError && <div className="admin-alert admin-alert-error" role="alert">{bookingError}</div>}
            <label className="admin-booking-notes-label">Internal admin notes<textarea rows="4" maxLength="2000" value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} placeholder="Notes visible only to administrators" /></label>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setEditingBooking(null)}>Close</button><button type="submit" className="admin-primary-button" disabled={bookingSaving}>{bookingSaving ? "Saving…" : "Save notes"}</button></div>
          </form>
        </div>
      )}

      {editingEnquiry && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingEnquiry(null); }}>
          <form className="admin-modal admin-enquiry-modal" onSubmit={saveEnquiryNotes}>
            <button type="button" className="admin-modal-close" onClick={() => setEditingEnquiry(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">MESSAGE DETAILS</span>
            <h2>{editingEnquiry.subject}</h2>
            <div className="admin-enquiry-sender"><strong>{editingEnquiry.name}</strong><a href={`mailto:${editingEnquiry.email}`}>{editingEnquiry.email}</a>{editingEnquiry.phone && <a href={`tel:${editingEnquiry.phone}`}>{editingEnquiry.phone}</a>}<small>{editingEnquiry.createdAt ? new Date(editingEnquiry.createdAt).toLocaleString() : ""}</small></div>
            <p className="admin-enquiry-message">{editingEnquiry.message}</p>
            {enquiryError && <div className="admin-alert admin-alert-error" role="alert">{enquiryError}</div>}
            <label className="admin-booking-notes-label">Internal admin notes<textarea rows="4" maxLength="2000" value={enquiryNotes} onChange={(e) => setEnquiryNotes(e.target.value)} placeholder="Notes visible only to administrators" /></label>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setEditingEnquiry(null)}>Close</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save notes"}</button></div>
          </form>
        </div>
      )}

      {viewingUser && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingUser(null); }}>
          <section className="admin-modal admin-history-modal" role="dialog" aria-modal="true" aria-labelledby="admin-history-title">
            <button type="button" className="admin-modal-close" onClick={() => setViewingUser(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">CUSTOMER RECORD</span>
            <h2 id="admin-history-title">{viewingUser.username}'s booking history</h2>
            <p className="admin-form-note">{viewingUser.email}</p>
            {userBookingsError && <div className="admin-alert admin-alert-error" role="alert">{userBookingsError}</div>}
            {userBookingsLoading ? <p className="admin-empty">Loading booking history…</p> : userBookings.length === 0 ? <p className="admin-empty">No bookings found for this traveler.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-history-table">
                  <thead><tr><th>TOUR</th><th>TRAVEL DATE</th><th>TRAVELERS</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                  <tbody>{userBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.tourId?.title || "Tour removed"}<small className="admin-booking-customer">{booking.tourId?.city || ""}</small></td>
                      <td>{booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : "—"}</td>
                      <td>{booking.guestSize}</td>
                      <td>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</td>
                      <td><span className="admin-badge">{booking.bookingStatus}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {editingUser && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingUser(null); }}>
          <form className="admin-modal admin-user-modal" onSubmit={saveUser}>
            <button type="button" className="admin-modal-close" onClick={() => setEditingUser(null)} aria-label="Close"><i className="ri-close-line" /></button>
            <span className="admin-eyebrow">MEMBER PROFILE</span><h2>Edit person</h2>
            <label>Name<input required value={editingUser.username || ""} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} /></label>
            <label>Email<input required type="email" value={editingUser.email || ""} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} /></label>
            <label>Photo URL<input value={editingUser.photo || ""} onChange={(e) => setEditingUser({ ...editingUser, photo: e.target.value })} /></label>
            <p className="admin-form-note">Passwords and account roles are protected and cannot be changed here.</p>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel-button" onClick={() => setEditingUser(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Admin;
