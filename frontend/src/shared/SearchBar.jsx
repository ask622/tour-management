import React, { useState } from "react";
import "./search-bar.css";
import { Col, Form, FormGroup } from "reactstrap";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const navigate = useNavigate();
  const minimumDate = new Date().toISOString().slice(0, 10);

  const searchHandler = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("search", location.trim());
    if (travelDate) params.set("date", travelDate);
    params.set("travelers", travelers);
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <Col lg="12">
      <div className="search__bar">
        <Form className="d-flex align-items-center gap-4" onSubmit={searchHandler}>
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-map-pin-line"></i>
            </span>
            <div>
              <label htmlFor="trip-destination">Destination</label>
              <input
                id="trip-destination"
                type="text"
                placeholder="Where would you like to go?"
                value={location}
                maxLength="120"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </FormGroup>

          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-calendar-line"></i>
            </span>
            <div>
              <label htmlFor="trip-date">Travel date</label>
              <input
                id="trip-date"
                type="date"
                min={minimumDate}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </FormGroup>

          <FormGroup className="d-flex gap-1 form__group">
            <span>
              <i className="ri-group-line"></i>
            </span>
            <div>
              <label htmlFor="trip-travelers">Travelers</label>
              <input
                id="trip-travelers"
                type="number"
                min="1"
                max="100"
                required
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>
          </FormGroup>

          <button className="search__icon" type="submit" aria-label="Search tours">
            <i className="ri-search-line"></i>
          </button>
        </Form>
      </div>
    </Col>
  );
};

export default SearchBar;
