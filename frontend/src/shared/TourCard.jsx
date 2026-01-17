import React from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import "./tour-card.css";

const TourCard = ({ tour }) => {
  if (!tour) return null; // 🛡 Guard clause

  const { _id, title, city, image, price, featured, ratings = [], averageRating } = tour;

  // console.log("Tour Data:", tour); // Debug log

  // Ensure averageRating is a number and fallback to 0 if not available
  const rating = averageRating !== undefined && averageRating !== null ? averageRating : 0;

  return (
    <div className="tour__card">
      <Card>
        <div className="tour__img">
          {image && <img src={image} alt="tour-img" />}
          {featured && <span>Featured</span>}
        </div>

        <CardBody>
          <div className="card__top d-flex align-items-center justify-content-between">
            <span className="tour__location d-flex align-items-center gap-1">
              <i className="ri-map-pin-line"></i> {city}
            </span>
            <span className="tour__rating d-flex align-items-center gap-1">
              <i className="ri-star-fill"></i>
              {rating === 0 ? "No Ratings Yet" : rating.toFixed(1)}
              {ratings.length === 0 ? null : <span>({ratings.length})</span>}
            </span>
          </div>

          <h5 className="tour__title">
            <Link to={`/tour/${_id}`}>{title}</Link>
          </h5>

          <div className="card__bottom d-flex align-items-center justify-content-between mt-2">
            <h5>
              Rs.{price}
              <span>/per person</span>
            </h5>
            <button className="btn booking__btn">
              <Link to={`/tour/${_id}`}>Book Now</Link>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TourCard;
