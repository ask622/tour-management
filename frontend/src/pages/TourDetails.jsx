import React, { useEffect, useRef, useState, useContext } from "react";
import "../styles/tour-details.css";
import { Container, Row, Col, Form, ListGroup } from "reactstrap";
import { useParams } from "react-router-dom";
import calculateAvgRating from "../utils/avgRating";
import avatar from "../assets/images/avatar.jpg";
import Booking from "../components/Booking/Booking";
import Newsletter from "../shared/Newsletter";
import TourCard from "../shared/TourCard";
import { BASE_URL } from "../utils/config";
import useFetch from "./../hooks/useFatch";
import { AuthContext } from "./../context/AuthConstext";

const TourDetails = () => {
  const { id } = useParams();
  const reviewMsgRef = useRef("");
  const [tourRating, setTourRating] = useState(null);
  const { user } = useContext(AuthContext);

  const { data: tour, loading, error } = useFetch(`${BASE_URL}/api/v1/tours/${id}`);
  const [allRatings, setAllRatings] = useState([]);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [relatedTours, setRelatedTours] = useState([]);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    if (!tour) return undefined;
    window.scrollTo(0, 0);
    document.title = `${tour.title} | Yatraventure`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = (tour.description || tour.desc || "").slice(0, 160);
    let active = true;
    setAllRatings([]);
    setReviewLoadError("");
    setRelatedTours([]);
    fetch(`${BASE_URL}/api/v1/reviews/${id}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to load reviews");
        return result;
      })
      .then((result) => {
        if (active) setAllRatings(result.data || []);
      })
      .catch((reviewError) => {
        if (active) setReviewLoadError(reviewError.message);
      });
    const relatedQuery = new URLSearchParams({ searchTerm: tour.city || "" });
    fetch(`${BASE_URL}/api/v1/tours/search/getTourBySearch?${relatedQuery.toString()}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to load similar journeys");
        return result;
      })
      .then((result) => {
        if (active) setRelatedTours((result.data || []).filter((item) => item._id !== tour._id).slice(0, 3));
      })
      .catch(() => {
        if (active) setRelatedTours([]);
      });
    return () => { active = false; };
  }, [tour, id]);

  if (loading) {
    return <main className="tour-detail-state"><div className="tour-detail-skeleton" aria-label="Loading tour details"><span /><div /><div /></div></main>;
  }
  if (error) {
    return <main className="tour-detail-state" role="alert"><i className="ri-wifi-off-line" /><h2>We couldn’t load this journey.</h2><p>{error}</p></main>;
  }
  if (!tour) {
    return <main className="tour-detail-state"><i className="ri-compass-3-line" /><h2>Journey not found</h2><p>This trip may have been removed or is no longer available.</p></main>;
  }

  const { image, title, price, discountPrice, description, desc, city, distance, duration, maxGroupSize, maxPeople } = tour;
  const currentPrice = discountPrice ?? price;
  const gallery = [...(image ? [image] : []), ...(Array.isArray(tour.gallery) ? tour.gallery : [])].filter(Boolean);
  const { totalRating, avgRating } = calculateAvgRating(allRatings);

  const submitHandler = async e => {
    e.preventDefault();
    const reviewText = reviewMsgRef.current.value;

    if (!user || user === "undefined" || user === null) {
      setReviewError("Please sign in to leave a review.");
      return;
    }

    if (!tourRating) {
      setReviewError("Choose a star rating before submitting.");
      return;
    }

    setReviewSaving(true);
    setReviewError("");
    setReviewNotice("");
    try {
      const res = await fetch(`${BASE_URL}/api/v1/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reviewText, rating: tourRating })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Could not submit your review");
      }
      setReviewNotice(result.message || "Review submitted for administrator approval.");
      reviewMsgRef.current.value = "";
      setTourRating(null);
    } catch (err) {
      setReviewError(err.message || "Could not submit your review");
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <>
      <section>
        <Container>
          <Row>
              <Col lg="6" md="12" xs="12">
                <div className="tour__content">
                  <img src={image} alt={title} />
                  {gallery.length > 1 && <div className="tour__gallery">{gallery.slice(1).map((photo, index) => <img src={photo} alt={`${title} ${index + 2}`} loading="lazy" decoding="async" key={`${photo}-${index}`} />)}</div>}
                  <div className="tour__info">
                    <h2>{title}</h2>
                    <div className="d-flex align-items-center gap-5">
                      <span className="tour__rating d-flex align-items-center gap-1">
                        <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
                        {avgRating !== 0 && avgRating}
                        {totalRating === 0 ? "Not Rated" : <span>({allRatings?.length})</span>}
                      </span>
                      <span>
                        <i className="ri-map-pin-user-fill"></i> {city}
                      </span>
                    </div>
                    <div className="tour__extra-details">
                      <span>
                        <i className="ri-wallet-2-fill"></i> ₹{Number(currentPrice).toLocaleString("en-IN")} /per person
                        {discountPrice != null && <del className="tour__old-price">₹{Number(price).toLocaleString("en-IN")}</del>}
                      </span>
                      <span>
                        <i className="ri-map-pin-time-line"></i> {distance} k/m
                      </span>
                      <span>
                        <i className="ri-group-line"></i> {maxPeople || maxGroupSize} People
                      </span>
                      {duration && <span><i className="ri-time-line"></i> {duration}</span>}
                    </div>
                    <h5>Description</h5>
                    <p>{description || desc}</p>
                    {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && <><h5>Itinerary</h5><ol className="tour__itinerary">{tour.itinerary.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol></>}
                    <div className="tour__service-lists">
                      {Array.isArray(tour.includedServices) && tour.includedServices.length > 0 && <div><h5>Included</h5><ul>{tour.includedServices.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>}
                      {Array.isArray(tour.excludedServices) && tour.excludedServices.length > 0 && <div><h5>Not included</h5><ul>{tour.excludedServices.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>}
                    </div>
                  </div>

                  <div className="tour__reviews mt-4">
                    <h4>Reviews {allRatings?.length}</h4>
                    {reviewLoadError && <p className="text-danger" role="alert">{reviewLoadError}</p>}
                    <Form onSubmit={submitHandler}>
                      <div className="d-flex align-items-center gap-3 mb-4 rating__group">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setTourRating(star)}
                            aria-label={`Rate ${star} out of 5`}
                            aria-pressed={tourRating === star}
                            style={{ color: tourRating === star ? "#e58b12" : "inherit" }}
                          >
                            {star} <i className="ri-star-s-fill"></i>
                          </button>
                        ))}
                      </div>
                      <div className="reviews__input">
                        <input
                          type="text"
                          ref={reviewMsgRef}
                          placeholder="Share your thoughts"
                          maxLength="2000"
                          required
                        />
                        <button className="btn primary__btn text-white" type="submit" disabled={reviewSaving}>
                          {reviewSaving ? "Submitting…" : "Submit"}
                        </button>
                      </div>
                    </Form>
                    {reviewError && <p className="text-danger" role="alert">{reviewError}</p>}
                    {reviewNotice && <p className="text-success" role="status">{reviewNotice}</p>}

                    <ListGroup className="user__reviews">
                      {allRatings.length > 0 ? (
                        allRatings.map((review, index) => (
                          <div className="review__item" key={index}>
                            <img src={avatar} alt="User Avatar" />
                            <div className="w-100">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <p>{review.username}</p>
                                </div>
                                <span className="d-flex align-items-center">
                                  {review.rating} <i className="ri-star-s-fill"></i>
                                </span>
                              </div>
                              <h6>{review.reviewText}</h6>
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
              <Col lg="6" md="12" xs="12">
                <Booking tour={tour} avgRating={avgRating} />
              </Col>
          </Row>
        </Container>
      </section>
      {relatedTours.length > 0 && <section className="tour-related-section">
        <Container>
          <div className="tour-related-heading"><span>KEEP EXPLORING</span><h2>More journeys nearby</h2></div>
          <Row>{relatedTours.map((relatedTour) => <Col lg="4" md="6" xs="12" className="mb-4" key={relatedTour._id}><TourCard tour={relatedTour} /></Col>)}</Row>
        </Container>
      </section>}
      <Newsletter />
    </>
  );
};

export default TourDetails;
