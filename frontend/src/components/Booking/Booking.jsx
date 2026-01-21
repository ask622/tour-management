import React, { useState, useContext } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import { AuthContext } from "../../context/AuthConstext";

const Booking = ({ tour, avgRating }) => {
  const { price, ratings = [] } = tour; // Destructure ratings from tour
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [credentials, setCredentials] = useState({
    userId: "01",
    userEmail: "example@gmail.com",
    fullName: "",
    phone: "",
    guestSize: 1,
    bookAt: "",
    paymentMethod: "razorpay",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const serviceFee = 830;
  const totalAmount =
    Number(price) * Number(credentials.guestSize) + Number(serviceFee);

  const handleClick = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      alert("Please login to book a tour!");
      navigate("/login");
      return;
    }

    if (!credentials.fullName || credentials.fullName.length < 4) {
      alert("Please enter a valid name!");
      return;
    }
    if (!credentials.phone || credentials.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number!");
      return;
    }
    if (!credentials.bookAt || credentials.guestSize < 1) {
      alert("Please fill all fields correctly!");
      return;
    }

    // Validate payment method details
    if (credentials.paymentMethod === "credit-card" || credentials.paymentMethod === "debit-card") {
      if (!credentials.cardNumber || credentials.cardNumber.length !== 16) {
        alert("Please enter a valid 16-digit card number!");
        return;
      }
      if (!credentials.cardHolder || credentials.cardHolder.length < 3) {
        alert("Please enter a valid cardholder name!");
        return;
      }
      if (!credentials.expiryDate || !/^\d{2}\/\d{2}$/.test(credentials.expiryDate)) {
        alert("Please enter expiry date in MM/YY format!");
        return;
      }
      if (!credentials.cvv || credentials.cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV!");
        return;
      }
    } else if (credentials.paymentMethod === "upi") {
      if (!credentials.upiId || !credentials.upiId.includes("@")) {
        alert("Please enter a valid UPI ID!");
        return;
      }
    } else if (credentials.paymentMethod === "razorpay") {
      // Razorpay payment will be handled by Razorpay gateway
      // No additional validation needed here
    }

    // Save booking to backend
    saveBooking(credentials);
  };

  const saveBooking = async (bookingData) => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          tourId: tour._id,
          totalAmount: totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save booking");
      }

      const data = await response.json();
      alert("Tour booked successfully!");
      navigate("/Thank-you");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="booking">
      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>
          Rs.{price}
          <span>/per person</span>
        </h3>
        <span className="tour__rating d-flex align-items-center gap-1">
          <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
          {avgRating !== 0 && avgRating}
          {ratings?.length === 0 ? " Not Rated" : <span>({ratings?.length})</span>}
        </span>
      </div>

      <div className="booking__form">
        <h5>Information</h5>
        {!user ? (
          <div className="login__prompt">
            <p>Please <span onClick={() => navigate("/login")} className="login__link">login</span> to book a tour</p>
          </div>
        ) : (
          <Form className="booking__info-form" onSubmit={handleClick}>
          <FormGroup>
            <input
              type="text"
              placeholder="Full Name"
              id="fullName"
              value={credentials.fullName}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <input
              type="text"
              placeholder="Phone"
              id="phone"
              value={credentials.phone}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input type="date" id="bookAt" onChange={handleChange} required />
            <input
              type="text"
              placeholder="Guest"
              id="guestSize"
              value={credentials.guestSize}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </Form>
        )}
      </div>

      {user && (
      <div className="booking__form">
        <h5>Payment Method</h5>
        <Form className="booking__payment-form">
          <FormGroup className="payment__method-group">
            <div className="payment__methods">
              <label className="payment__label razorpay__label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={credentials.paymentMethod === "razorpay"}
                  onChange={handleChange}
                  id="paymentMethod"
                />
                <span>Razorpay <i className="ri-secure-payment-line"></i></span>
              </label>
              <label className="payment__label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit-card"
                  checked={credentials.paymentMethod === "credit-card"}
                  onChange={handleChange}
                  id="paymentMethod"
                />
                <span>Credit Card</span>
              </label>
              <label className="payment__label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="debit-card"
                  checked={credentials.paymentMethod === "debit-card"}
                  onChange={handleChange}
                  id="paymentMethod"
                />
                <span>Debit Card</span>
              </label>
              <label className="payment__label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={credentials.paymentMethod === "upi"}
                  onChange={handleChange}
                  id="paymentMethod"
                />
                <span>UPI</span>
              </label>
              <label className="payment__label">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={credentials.paymentMethod === "wallet"}
                  onChange={handleChange}
                  id="paymentMethod"
                />
                <span>Digital Wallet</span>
              </label>
            </div>
          </FormGroup>

          {/* Card Details - for Credit/Debit Card */}
          {(credentials.paymentMethod === "credit-card" || credentials.paymentMethod === "debit-card") && (
            <div className="card__details">
              <FormGroup>
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength="16"
                  value={credentials.cardNumber}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="cardHolder">Cardholder Name</label>
                <input
                  type="text"
                  id="cardHolder"
                  placeholder="John Doe"
                  value={credentials.cardHolder}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <div className="card__row d-flex gap-2">
                <FormGroup className="flex-fill">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={credentials.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup className="flex-fill">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    maxLength="3"
                    value={credentials.cvv}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </div>
            </div>
          )}

          {/* Razorpay Payment Info */}
          {credentials.paymentMethod === "razorpay" && (
            <div className="razorpay__info">
              <p className="razorpay__note">
                <i className="ri-secure-payment-line"></i>
                Safe, secure & encrypted payments powered by Razorpay. Pay using Credit Card, Debit Card, UPI, Wallets & more.
              </p>
              <div className="razorpay__methods">
                <span className="razorpay__badge">💳 Credit Card</span>
                <span className="razorpay__badge">💳 Debit Card</span>
                <span className="razorpay__badge">📱 UPI</span>
                <span className="razorpay__badge">💰 Wallets</span>
              </div>
            </div>
          )}

          {/* UPI Details */}
          {credentials.paymentMethod === "upi" && (
            <div className="upi__section">
              <FormGroup>
                <label htmlFor="upiId">Your UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  placeholder="example@upi"
                  value={credentials.upiId}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <div className="upi__qr-container">
                <p className="upi__qr-label">Pay using your phone's UPI app</p>
                <div className="upi__qr-code">
                  <QRCode
                    value={`upi://pay?pa=639797516@fbl&pn=TourBooking&am=${totalAmount}&tr=${Date.now()}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="upi__qr-info">
                  <i className="ri-phone-camera-line"></i>
                  Scan this QR code with any UPI app to pay
                </p>
                <div className="upi__id-display">
                  <p className="upi__id-label">Or send money directly to:</p>
                  <p className="upi__id-value">639797516@fam</p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Details */}
          {credentials.paymentMethod === "wallet" && (
            <div className="wallet__info">
              <p className="wallet__note">Select your preferred digital wallet during payment</p>
            </div>
          )}
        </Form>
      </div>
      )}

      <div className="booking__botton">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              Rs.{price} <i className="ri-close-line"></i>Per person
            </h5>
            <span>Rs.{price}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0">
            <h5> Service charge </h5>
            <span>Rs.{serviceFee}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0 total">
            <h5>Total</h5>
            <span>Rs.{totalAmount}</span>
          </ListGroupItem>
        </ListGroup>
        <Button
          className="btn primary__btn w-100 mt-4"
          onClick={handleClick}
          type="submit"
          disabled={!user}
          title={!user ? "Please login to book a tour" : ""}
        >
          {!user ? "Login to Book" : "Book Now"}
        </Button>
      </div>
    </div>
  );
};

export default Booking;
