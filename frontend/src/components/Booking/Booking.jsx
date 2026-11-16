import React, { useContext, useState } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthConstext";
import { BASE_URL } from "../../utils/config";

const BOOKING_SERVICE_FEE = 830;

const Booking = ({ tour, avgRating }) => {
  const { ratings = [] } = tour;
  const price = tour.discountPrice ?? tour.price;
  const availableDates = Array.isArray(tour.availableDates) ? tour.availableDates : [];
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [details, setDetails] = useState({
    fullName: user?.username || "",
    phone: "",
    guestSize: 1,
    bookAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = Number(price) * Number(details.guestSize);
  const discountAmount = couponApplied?.discountAmount || 0;
  const totalAmount = subtotal + BOOKING_SERVICE_FEE - discountAmount;
  const minimumDate = new Date().toISOString().slice(0, 10);
  const maximumTravelers = Number(tour.maxPeople || tour.maxGroupSize) || undefined;

  const handleChange = (event) => {
    const { id, value } = event.target;
    setDetails((current) => ({ ...current, [id]: value }));
    if (id === "guestSize") setCouponApplied(null);
  };

  const applyCoupon = async () => {
    setCouponChecking(true);
    setCouponError("");
    setCouponApplied(null);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Coupon could not be applied");
      setCouponApplied(result.data);
    } catch (validationError) {
      setCouponError(validationError.message);
    } finally {
      setCouponChecking(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (couponCode.trim() && !couponApplied) {
      setError("Apply the coupon or clear the coupon code before requesting this trip.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/bookings/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          tourId: tour._id,
          paymentMethod: "pay-on-arrival",
          couponCode: couponApplied?.code || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not create booking");
      navigate("/Thank-you", { state: { message: result.message } });
    } catch (bookingError) {
      setError(bookingError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booking">
      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>₹{Number(price).toLocaleString("en-IN")}<span>/per person</span></h3>
        <span className="tour__rating d-flex align-items-center gap-1">
          <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }} aria-hidden="true" />
          {avgRating || "Not rated"}
          {ratings.length > 0 && <span>({ratings.length})</span>}
        </span>
      </div>

      <Form className="booking__info-form" onSubmit={handleSubmit}>
        <h5>Request your trip</h5>
        <FormGroup>
          <input
            type="text"
            id="fullName"
            autoComplete="name"
            placeholder="Full name"
            minLength="2"
            required
            value={details.fullName}
            onChange={handleChange}
            disabled={!user || saving}
          />
        </FormGroup>
        <FormGroup>
          <input
            type="tel"
            id="phone"
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength="10"
            placeholder="10-digit phone number"
            required
            value={details.phone}
            onChange={handleChange}
            disabled={!user || saving}
          />
        </FormGroup>
        <FormGroup className="d-flex align-items-center gap-3">
          {availableDates.length > 0 ? (
            <select id="bookAt" required value={details.bookAt} onChange={handleChange} disabled={!user || saving}>
              <option value="">Select available date</option>
              {availableDates.map((date) => {
                const value = new Date(date).toISOString().slice(0, 10);
                return value >= minimumDate ? <option value={value} key={value}>{new Date(`${value}T00:00:00`).toLocaleDateString()}</option> : null;
              })}
            </select>
          ) : (
            <input
              type="date"
              id="bookAt"
              min={minimumDate}
              required
              value={details.bookAt}
              onChange={handleChange}
              disabled={!user || saving}
            />
          )}
          <input
            type="number"
            id="guestSize"
            min="1"
            max={maximumTravelers}
            aria-label="Number of travelers"
            required
            value={details.guestSize}
            onChange={handleChange}
            disabled={!user || saving}
          />
        </FormGroup>

        <div className="booking__coupon-control">
          <input
            type="text"
            aria-label="Coupon code"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCouponApplied(null); setCouponError(""); }}
            disabled={!user || saving || couponChecking}
          />
          <Button type="button" className="btn secondary__btn" onClick={applyCoupon} disabled={!user || !couponCode.trim() || couponChecking || saving}>
            {couponChecking ? "Checking…" : couponApplied ? "Applied" : "Apply"}
          </Button>
        </div>
        {couponError && <p className="booking__error" role="alert">{couponError}</p>}
        {couponApplied && <p className="booking__coupon-success" role="status">{couponApplied.code} applied: save ₹{Number(couponApplied.discountAmount).toLocaleString("en-IN")}</p>}

        <div className="booking__payment-note">
          <i className="ri-information-line" aria-hidden="true" />
          <p>Send a reservation request now. Online payment is not enabled; payment remains pending until verified separately.</p>
        </div>
        {error && <p className="booking__error" role="alert">{error}</p>}

        <div className="booking__botton">
          <ListGroup>
            <ListGroupItem className="border-0 px-0">
              <h5>{details.guestSize} traveler{Number(details.guestSize) === 1 ? "" : "s"}</h5>
              <span>₹{(Number(price) * Number(details.guestSize)).toLocaleString("en-IN")}</span>
            </ListGroupItem>
            <ListGroupItem className="border-0 px-0">
              <h5>Service fee</h5>
              <span>₹{BOOKING_SERVICE_FEE.toLocaleString("en-IN")}</span>
            </ListGroupItem>
            {discountAmount > 0 && <ListGroupItem className="border-0 px-0">
              <h5>Coupon discount</h5>
              <span>−₹{discountAmount.toLocaleString("en-IN")}</span>
            </ListGroupItem>}
            <ListGroupItem className="border-0 px-0 total">
              <h5>Total</h5>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </ListGroupItem>
          </ListGroup>
          <Button
            className="btn primary__btn w-100 mt-4"
            type={user ? "submit" : "button"}
            onClick={!user ? () => navigate("/login") : undefined}
            disabled={saving}
          >
            {!user ? "Login to request" : saving ? "Sending request…" : "Request this trip"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Booking;
