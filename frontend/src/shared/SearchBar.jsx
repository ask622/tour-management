import React, { useState } from "react";
import "./search-bar.css";
import { Col, Form, FormGroup } from "reactstrap";
import { BASE_URL } from '../utils/config';
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');

  const navigate = useNavigate();

  const searchHandler = async (e) => {
    e.preventDefault();

    if (!location || !distance || !maxGroupSize) {
      return alert("All fields are required!");
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/tours/search/getTourBySearch?city=${location}&distance=${Number(
          distance
        )}&maxPeople=${Number(maxGroupSize)}`
      );

      if (!res.ok) {
        throw new Error("Something went wrong!");
      }

      const result = await res.json();
      navigate(`/tours/search`, { state: result.data });
    } catch (error) {
      alert(error.message);
    }
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
              <h6>Location</h6>
              <input
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </FormGroup>

          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-map-pin-time-line"></i>
            </span>
            <div>
              <h6>Distance</h6>
              <input
                type="number"
                placeholder="Distance (km)"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>
          </FormGroup>

          <FormGroup className="d-flex gap-1 form__group">
            <span>
              <i className="ri-group-line"></i>
            </span>
            <div>
              <h6>Max People</h6>
              <input
                type="number"
                placeholder="0"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(e.target.value)}
              />
            </div>
          </FormGroup>

   
          <button className="search__icon" type="submit">
            <i className="ri-search-line"></i>
          </button>

        </Form>
      </div>
    </Col>
  );
};

export default SearchBar;
