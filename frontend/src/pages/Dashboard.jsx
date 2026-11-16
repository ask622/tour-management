import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import { AuthContext } from "../context/AuthConstext";
import { BASE_URL } from "../utils/config";
import "./dashboard.css";

const Dashboard = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user?._id) return undefined;
    let active = true;

    const loadAccount = async () => {
      setLoading(true);
      setError("");
      try {
        const [bookingResponse, profileResponse] = await Promise.all([
          fetch(`${BASE_URL}/api/bookings/mine`, { credentials: "include" }),
          fetch(`${BASE_URL}/api/v1/users/${user._id}`, { credentials: "include" }),
        ]);
        const [bookingResult, profileResult] = await Promise.all([
          bookingResponse.json(),
          profileResponse.json(),
        ]);
        if (!bookingResponse.ok) throw new Error(bookingResult.message || "Could not load your bookings");
        if (!profileResponse.ok) throw new Error(profileResult.message || "Could not load your profile");
        if (active) {
          setBookings(Array.isArray(bookingResult.data) ? bookingResult.data : []);
          setProfile({
            username: profileResult.data?.username || "",
            email: profileResult.data?.email || "",
          });
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAccount();
    return () => { active = false; };
  }, [user?._id]);

  if (!user?._id) return <Navigate to="/login" replace />;

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users/${user._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update your profile");
      dispatch({ type: "PROFILE_UPDATE", payload: result.data });
      setProfile({ username: result.data.username, email: result.data.email });
      setNotice("Your profile has been updated.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this pending booking request?")) return;
    setCancellingId(bookingId);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not cancel this booking");
      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? { ...booking, bookingStatus: result.data.bookingStatus } : booking
      )));
      setNotice(result.message || "Booking request cancelled.");
    } catch (cancelError) {
      setError(cancelError.message);
    } finally {
      setCancellingId("");
    }
  };

  return (
    <main className="account-page">
      <Container>
        <header className="account-heading">
          <span>YOUR YATRAVENTURE</span>
          <h1>Welcome back, {user.username || "traveler"}.</h1>
          <p>Manage your details and keep track of the journeys you’ve requested.</p>
        </header>

        {error && <p className="account-message account-message--error" role="alert">{error}</p>}
        {notice && <p className="account-message account-message--success" role="status">{notice}</p>}

        <div className="account-grid">
          <section className="account-panel">
            <div className="account-panel-heading">
              <span className="ri-user-line" aria-hidden="true" />
              <div><h2>Your profile</h2><p>Keep your contact details up to date.</p></div>
            </div>
            <form className="account-profile-form" onSubmit={saveProfile}>
              <label>
                Name
                <input
                  type="text"
                  autoComplete="name"
                  minLength="2"
                  maxLength="80"
                  required
                  value={profile.username}
                  onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))}
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  required
                  value={profile.email}
                  onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <button type="submit" disabled={savingProfile || loading}>
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>

          <section className="account-panel account-bookings">
            <div className="account-panel-heading">
              <span className="ri-suitcase-line" aria-hidden="true" />
              <div><h2>Your bookings</h2><p>Requests, dates and current status.</p></div>
              {!loading && <strong>{bookings.length}</strong>}
            </div>
            {loading ? (
              <div className="account-booking-skeleton" aria-label="Loading bookings">
                <span /><span /><span />
              </div>
            ) : bookings.length === 0 ? (
              <div className="account-empty-state">
                <i className="ri-map-2-line" aria-hidden="true" />
                <h3>Your next story starts here.</h3>
                <p>You haven’t requested a trip yet. Find a journey that feels like you.</p>
                <Link to="/tours">Explore tours <i className="ri-arrow-right-line" /></Link>
              </div>
            ) : (
              <div className="account-booking-list">
                {bookings.map((booking) => (
                  <article className="account-booking-card" key={booking._id}>
                    {booking.tourId?.image ? (
                      <img src={booking.tourId.image} alt="" />
                    ) : (
                      <div className="account-booking-placeholder"><i className="ri-landscape-line" /></div>
                    )}
                    <div className="account-booking-content">
                      <div className="account-booking-title">
                        <div>
                          <h3>{booking.tourId?.title || "Travel experience"}</h3>
                          <p><i className="ri-map-pin-line" /> {booking.tourId?.city || "Destination details unavailable"}</p>
                        </div>
                        <span className={`account-status account-status--${booking.bookingStatus}`}>{booking.bookingStatus}</span>
                      </div>
                      <div className="account-booking-meta">
                        <span><i className="ri-calendar-line" /> {booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : "Date pending"}</span>
                        <span><i className="ri-group-line" /> {booking.guestSize} traveler{booking.guestSize === 1 ? "" : "s"}</span>
                        <strong>₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}</strong>
                      </div>
                      <div className="account-booking-actions">
                        {booking.bookingStatus === "pending" && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                          >
                            {cancellingId === booking._id ? "Cancelling…" : "Cancel request"}
                          </button>
                        )}
                        {booking.tourId?._id && <Link to={`/tour/${booking.tourId._id}`}>View trip</Link>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
};

export default Dashboard;
