import React from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import "./tour-card.css";

const TourCard = ({ tour }) => {
  if (!tour) return null; // 🛡 Guard clause

  const { _id, title, city, image, price, discountPrice, featured, ratings = [], ratingCount, averageRating, duration } = tour;
  const currentPrice = discountPrice ?? price;
  const rating = Number(averageRating) || 0;

  return (
    <div className="tour__card">
      <Card>
        <div className="tour__img">
          {image && <img src={image} alt={`${title} in ${city}`} loading="lazy" decoding="async" />}
          {featured && <span><i className="ri-sparkling-2-line" /> Featured</span>}
        </div>

        <CardBody>
          <div className="card__top d-flex align-items-center justify-content-between">
            <span className="tour__location d-flex align-items-center gap-1">
              <i className="ri-map-pin-line"></i> {city}
            </span>
            <span className="tour__rating d-flex align-items-center gap-1">
              <i className="ri-star-fill"></i>
              {rating === 0 ? "No Ratings Yet" : rating.toFixed(1)}
              {(ratingCount || ratings.length) > 0 && <span>({ratingCount || ratings.length})</span>}
            </span>
          </div>

          <h5 className="tour__title">
            <Link to={`/tour/${_id}`}>{title}</Link>
          </h5>
          {duration && <p className="tour-card-duration"><i className="ri-time-line" aria-hidden="true" /> {duration}</p>}

          <div className="card__bottom d-flex align-items-center justify-content-between mt-2">
            <h5>
              ₹{Number(currentPrice || 0).toLocaleString("en-IN")}
              {discountPrice != null && <del>₹{Number(price).toLocaleString("en-IN")}</del>}
              <span>/per person</span>
            </h5>
            <Link className="booking__btn" to={`/tour/${_id}`}>View trip <i className="ri-arrow-right-line" /></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TourCard;
