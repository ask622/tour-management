import React, { useMemo, useState } from "react";
import "./search-bar.css";
import { Col, Form, FormGroup } from "reactstrap";
import { BASE_URL } from '../utils/config';
import { useNavigate } from "react-router-dom";
import toursData from '../assets/data/tours';

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const query = location.trim().toLowerCase();

    if (!query) return [];

    return toursData
      .filter((tour) => {
        const title = tour.title?.toLowerCase() || '';
        const city = tour.city?.toLowerCase() || '';
        return title.includes(query) || city.includes(query);
      })
      .slice(0, 6)
      .map((tour) => ({
        label: `${tour.title} • ${tour.city}`,
        value: tour.title,
      }));
  }, [location]);

  const searchHandler = async (e) => {
    e.preventDefault();

    if (!location.trim()) {
      return alert("Please enter a location or tour name!");
    }

    try {
      const params = new URLSearchParams({
        searchTerm: location.trim(),
      });

      if (distance) {
        params.set("distance", String(Number(distance)));
      }

      if (maxGroupSize) {
        params.set("maxPeople", String(Number(maxGroupSize)));
      }

      const res = await fetch(
        `${BASE_URL}/api/v1/tours/search/getTourBySearch?${params.toString()}`
      );

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || errorBody?.message || 'Something went wrong!');
      }

      const result = await res.json();
      navigate(`/tours/search`, { state: result.data });
      setShowSuggestions(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSuggestionClick = (value) => {
    setLocation(value);
    setShowSuggestions(false);
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
              <h6>Location or Tour Name</h6>
              <input
                type="text"
                placeholder="Where are you going or type a tour name"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="search__suggestions">
                  {suggestions.map((item) => (
                    <li key={item.value} onMouseDown={() => handleSuggestionClick(item.value)}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
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
