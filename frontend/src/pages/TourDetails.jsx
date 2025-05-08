import React, { useEffect, useRef, useState } from "react";
import "../styles/tour-details.css";
import { Container, Row, Col, Form, ListGroup } from "reactstrap";
import { useParams } from "react-router-dom";
import calculateAvgRating from "../utils/avgRating";
import avatar from "../assets/images/avatar.jpg";
import Booking from "../components/Booking/Booking";
import Newsletter from "../shared/Newsletter";
import { BASE_URL } from "../utils/config";
import useFetch from "./../hooks/useFatch";

const TourDetails = () => {
  const { id } = useParams();
  const reviewMsgRef = useRef("");
  const [tourRating, setTourRating] = useState(null);

  const { data: tour, loading, error } = useFetch(`${BASE_URL}/api/v1/tours/${id}`);
  console.log("Tour Data:", tour); // Debug log

  useEffect(() => {
    if (tour) {
      window.scrollTo(0, 0); // Scroll to top only if tour is available
    }
  }, [tour]);

  if (!tour) {
    return <h2>Tour not found</h2>;
  }

  const { image, title, desc, price, ratings = [], city, distance, maxGroupSize } = tour;
  const { totalRating, avgRating } = calculateAvgRating(ratings);
  // const options = { day: "numeric", month: "long", year: "numeric" };

  const submitHandler = (e) => {
    e.preventDefault();
    const reviewText = reviewMsgRef.current.value;

    if (!tourRating) {
      alert("Please select a star rating!");
      return;
    }

    alert(`Review Submitted:\n"${reviewText}"\nRating: ${tourRating} Stars`);
    reviewMsgRef.current.value = ""; // Clear input after submission
    setTourRating(null); // Reset rating selection
  };

  return (
    <>
      <section>
        <Container>
          {loading && <h4 className="text-center pt-5">Loading...</h4>}
          {error && <h4 className="text-center pt-5">{error}</h4>}
          {!loading && !error && (
            <Row>
              <Col lg="6">
                <div className="tour__content">
                  <img src={image} alt={title} />
                  <div className="tour__info">
                    <h2>{title}</h2>
                    <div className="d-flex align-items-center gap-5">
                      <span className="tour__rating d-flex align-items-center gap-1">
                        <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
                        {avgRating !== 0 && avgRating}
                        {totalRating === 0 ? "Not Rated" : <span>({ratings?.length})</span>}
                      </span>
                      <span>
                        <i className="ri-map-pin-user-fill"></i> {city}
                      </span>
                    </div>
                    <div className="tour__extra-details">
                      <span>
                        <i className="ri-wallet-2-fill"></i> Rs.{price} /per person
                      </span>
                      <span>
                        <i className="ri-map-pin-time-line"></i> {distance} k/m
                      </span>
                      <span>
                        <i className="ri-group-line"></i> {maxGroupSize} People
                      </span>
                    </div>
                    <h5>Description</h5>
                    <p>{desc}</p>
                  </div>

                  <div className="tour__reviews mt-4">
                    <h4>Reviews {ratings?.length } </h4>
                    <Form onSubmit={submitHandler}>
                      <div className="d-flex align-items-center gap-3 mb-4 rating__group">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} onClick={() => setTourRating(star)}>
                            {star} <i className="ri-star-s-fill"></i>
                          </span>
                        ))}
                      </div>
                      <div className="reviews__input">
                        <input
                          type="text"
                          ref={reviewMsgRef}
                          placeholder="Share your thoughts"
                          required
                        />
                        <button className="btn primary__btn text-white" type="submit">
                          Submit
                        </button>
                      </div>
                    </Form>

                    <ListGroup className="user__reviews">
                      {ratings?.length > 0 ? (
                        ratings.map((rating, index) => (
                          <div className="review__item" key={index}>
                            <img src={avatar} alt="User Avatar" />
                            <div className="w-100">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <p>{rating.user}</p>
                                </div>
                                <span className="d-flex align-items-center">
                                  {rating.rating} <i className="ri-star-s-fill"></i>
                                </span>
                              </div>
                              <h6>Great Experience!</h6>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No reviews available.</p>
                      )}
                    </ListGroup>
                  </div>
                </div>
              </Col>
              <Col lg="6">
                <Booking tour={tour} avgRating={avgRating} />
              </Col>
            </Row>
          )}
        </Container>
      </section>
      <Newsletter />
    </>
  );
};

export default TourDetails;
