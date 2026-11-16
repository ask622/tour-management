import React from "react";
import "../styles/home.css";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import heroImg from "../assets/images/hero-img01.jpg";
import heroImg02 from "../assets/images/hero-img02.jpg";
import Subtitle from "./../shared/Subtitle";
import SearchBar from "../shared/SearchBar";
import ServiceList from "../services/ServiceList";
import FeaturedTourList from "../components/Featured-tours/FeaturedTourList";
import FeaturedDestinations from "../components/Featured-tours/FeaturedDestinations";
import experienceImg from "../assets/images/experience.png";
import MasonryImageGallery from "../components/image-gallery/MasonryImageGallery";
import Testimonials from "../components/Testimonial/Testimonials";
import UttarakhandTour from "./UttarakhandTour";
import "../styles/uttrakhnad.css"
import useFetch from "../hooks/useFatch";
import { BASE_URL } from "../utils/config";


import Newsletter from "../shared/Newsletter";
const Home = () => {
  const { data: homeContent } = useFetch(`${BASE_URL}/api/v1/site-content/home`);
  const content = homeContent || {};
  const headingLines = (content.heroHeading || "Discover Your\nNext Adventure").split("\n");
  return (
    <>
      <section className="home-hero-section">
        <Container>
          <div className="home-hero">
            <div className="home-hero__copy">
              <span className="home-hero__eyebrow"><i className="ri-compass-3-line" /> YATRAVENTURE <span>•</span> UTTARAKHAND</span>
              <h1>{headingLines.map((line, index) => <React.Fragment key={`${line}-${index}`}>{index === 1 ? <em>{line}</em> : line}{index < headingLines.length - 1 && <br />}</React.Fragment>)}</h1>
              <p>{content.heroDescription || "From quiet Himalayan mornings to river-side adventures, discover journeys made for the way you love to travel."}</p>
              <div className="home-hero__actions">
                <Link to="/tours" className="home-hero__cta">Explore journeys <i className="ri-arrow-right-line" /></Link>
                <span><i className="ri-shield-check-line" /> Easy, secure booking</span>
              </div>
              <div className="home-hero__promise">
                <span><i className="ri-map-pin-line" /> Local experiences</span>
                <span><i className="ri-user-heart-line" /> Thoughtful journeys</span>
              </div>
            </div>
            <div className="home-hero__visual" aria-label="Travel photography from Uttarakhand">
              <div className="home-hero__photo home-hero__photo--main">
                <img src={content.heroImage || heroImg} alt="A memorable travel destination" />
              </div>
              <div className="home-hero__photo home-hero__photo--side">
                <img src={content.heroImageSecondary || heroImg02} alt="Mountain landscape in Uttarakhand" />
              </div>
              {content.promotionalBanner && <div className="home-promotion-banner"><span>{content.promotionalBanner}</span><Link to="/tours">Explore tours <i className="ri-arrow-right-line" /></Link></div>}
              <div className="home-hero__place-card">
                <span>YOUR NEXT CHAPTER</span>
                <strong>Somewhere<br />in the mountains.</strong>
                <i className="ri-arrow-up-right-line" aria-hidden="true" />
              </div>
              <div className="home-hero__stamp"><i className="ri-sun-line" /><span>TAKE<br />THE<br />SCENIC<br />ROUTE</span></div>
            </div>
          </div>
          <div className="home-hero__search">
            <div className="home-hero__search-heading">
              <span>PLAN YOUR NEXT ESCAPE</span>
              <p>Where would you like to go?</p>
            </div>
            <SearchBar />
          </div>
        </Container>
      </section>
      <section>
        <Container>
          <Row>
            <Col lg="3">
              <h5 className="services__subtitle">What We serve</h5>
              <h4 className="services__title">We offer our best services</h4>
            </Col>
            <ServiceList />
          </Row>
        </Container>
      </section>
      {/* ========================feature tour section======================= */}

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <Subtitle subtitle={"Explore"} />
              <h2 className="featured__tour-title">Our Featured Tour</h2>
            </Col>
            <FeaturedTourList tourIds={content.featuredTourIds || []} />
          </Row>
        </Container>
      </section>
      <FeaturedDestinations destinationIds={content.featuredDestinationIds || []} />
      {/* ========================feature tour section end======================= */}

      {/* ========================experience section start======================= */}
      <section>
  <Container>
    <Row>
      {/* Left Section - Experience Content */}
      <Col lg="6">
        <div className="experience__content">
          <Subtitle subtitle="Experience" />
          <h2>
            Explore the world with confidence, <br /> backed by our expertise
          </h2>
          <p>
            With years of experience in curating unforgettable travel experiences, 
            we ensure every journey is seamless and filled with breathtaking moments. 
            Our dedicated team is here to guide you through the best destinations, 
            offering comfort, adventure, and personalized services.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="counter__wrapper d-flex align-items-center gap-5">
          <div className="counter__box">
            <span>12k+</span>
            <h6>Successful Trips</h6>
          </div>
          <div className="counter__box">
            <span>2k+</span>
            <h6>Happy Travelers</h6>
          </div>
          <div className="counter__box">
            <span>16</span>
            <h6>Years of Experience</h6>
          </div>
        </div>
      </Col>

      {/* Right Section - Experience Image */}
      <Col lg="6">
        <div className="experience__img">
          <img src={experienceImg} alt="Experience" />
        </div>
      </Col>
    </Row>
  </Container>
</section>


      {/* ========================experience section end======================= */}
      {/* ================================gallery section start================== */}

      <section>
        <Container>
          <Row>
            <Col lg="12">
              <Subtitle subtitle={"Gallery"} />
              <h2 className="gallery__title">
                Visit our customers tour gallery
              </h2>
            </Col>
            <Col lg="12">
              <MasonryImageGallery />
            </Col>
          </Row>
        </Container>
      </section>
      {/* ================================gallery section end=============== */}
      {/* ========================Uttarakhand Tour Map Section======================= */}
      <section>
  <Container>
    <Row>
      <Col lg="12">
        <Subtitle subtitle={"Explore"} />
        <h2 className="featured__tour-title">Discover Uttarakhand</h2>
      </Col>
      <Col lg="12">
        <UttarakhandTour />
      </Col>
    </Row>
  </Container>
</section>

      {/* ================================testimonial section start =============== */}
       <section>
        <Container>
          <Row>
            <Col lg='12'>
            <Subtitle subtitle={'Fans Love'}/>
            <h2 className="testimonial_title">
              What our Fans say about us 
            </h2>
            </Col>
            <Col lg='12'>
            <Testimonials items={content.testimonials} />
            </Col>
          </Row>
        </Container>
       </section>
      {/* ================================testimonial section end =============== */}

       <Newsletter />
    </>
  );
};
export default Home;
