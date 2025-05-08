import React from 'react';
import './newsletter.css';
import { Container, Row, Col } from 'reactstrap';
import maleTourist from '../assets/images/male-tourist.png';

const Newsletter = () => {
  return (
    <section className="newsletter">
      <Container>
        <Row>
          <Col lg="6">
            <div className="newsletter__content">
              <h2>Stay Updated with Uttarakhand Travel Insights!</h2>
              <div className="newsletter__input">
                <input type="email" placeholder="Enter your email for exclusive travel updates" />
                <button className="btn newsletter__btn">Subscribe Now</button>
              </div>
              <p>
                Get the latest updates on Uttarakhand’s best travel destinations, adventure activities, and special discounts. Join our community and make your journey memorable!
              </p>
            </div>
          </Col>
          <Col lg="6">
            <div className="newsletter__img">
              <img src={maleTourist} alt="Travel Enthusiast" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Newsletter;
