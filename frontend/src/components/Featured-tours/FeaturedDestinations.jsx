import React from "react";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../utils/config";
import useFetch from "../../hooks/useFatch";

const FeaturedDestinations = ({ destinationIds = [] }) => {
  const { data: destinations } = useFetch(`${BASE_URL}/api/v1/destinations`);
  const selected = destinationIds.length
    ? destinationIds.map((id) => (destinations || []).find((destination) => destination._id === id)).filter(Boolean)
    : (destinations || []).filter((destination) => destination.featured).slice(0, 4);

  if (!selected.length) return null;

  return (
    <section className="home-destinations-section">
      <Container>
        <div className="home-destinations-heading">
          <span>PLACES TO REMEMBER</span>
          <h2>Find your next horizon.</h2>
        </div>
        <Row>
          {selected.map((destination) => (
            <Col lg="3" md="6" xs="12" className="mb-4" key={destination._id}>
              <Link className="home-destination-card" to={`/tours?destinationId=${encodeURIComponent(destination._id)}`}>
                {destination.image && <img src={destination.image} alt="" loading="lazy" decoding="async" />}
                <span>{destination.region || destination.country}</span>
                <h3>{destination.name}</h3>
                <p>{destination.description}</p>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default FeaturedDestinations;
