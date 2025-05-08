import React, { useState } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const Booking = ({ tour, avgRating }) => {
  const { price, ratings = [] } = tour; // Destructure ratings from tour
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    userId: "01",
    userEmail: "example@gmail.com",
    fullName: "",
    phone: "",
    guestSize: 1,
    bookAt: "",
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
    navigate("/Thank-you");
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
      </div>

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
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default Booking;
