import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import useFetch from "../hooks/useFatch";
import { BASE_URL } from "../utils/config";
import "../styles/about.css";

const reasons = [
  { icon: "ri-compass-3-line", title: "Local insight", description: "Thoughtfully planned routes, with the people and places that make each one special." },
  { icon: "ri-heart-3-line", title: "Travel with care", description: "Small details matter. We focus on comfortable, considered experiences from start to finish." },
  { icon: "ri-customer-service-2-line", title: "Here when you need us", description: "Our team is on hand to answer questions and help you plan with confidence." },
];

const About = () => {
  const { data: aboutContent } = useFetch(`${BASE_URL}/api/v1/site-content/about`);
  const content = aboutContent || {};

  return (
    <main className="about-page">
      <Container>
        <header className="about-hero">
          <span>ROOTED IN THE JOURNEY</span>
          <h1>Travel a little closer<br /><em>to what matters.</em></h1>
          <p>Yatraventure brings curious travelers closer to the landscapes, local stories and slower moments that make a trip stay with you.</p>
        </header>

        <section className="about-story">
          <div className="about-story-image">
            <img
              src={content.image || "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200&h=900&fit=crop"}
              alt="A quiet mountain journey through the Indian Himalayas"
              loading="lazy"
            />
            <span>THE BEST ROUTE IS THE ONE THAT FEELS LIKE YOURS.</span>
          </div>
          <div className="about-story-copy">
            <span>OUR STORY</span>
            <h2>More than a place on the map.</h2>
            <p>{content.introduction || "Yatraventure began with a simple idea: travel should feel personal, unhurried and connected to the place you came to see. We create experiences that leave room for discovery, while taking care of the details along the way."}</p>
            <div className="about-purpose-grid">
              <article>
                <i className="ri-flag-line" aria-hidden="true" />
                <h3>Our mission</h3>
                <p>{content.mission || "Make meaningful travel easier to plan, and make every journey more thoughtful."}</p>
              </article>
              <article>
                <i className="ri-eye-line" aria-hidden="true" />
                <h3>Our vision</h3>
                <p>{content.vision || "A world where every traveler feels welcome to explore with curiosity and care."}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="about-section-heading">
            <span>THE YATRAVENTURE DIFFERENCE</span>
            <h2>A better kind of getaway.</h2>
          </div>
          <div className="about-reason-grid">
            {reasons.map((reason) => (
              <article key={reason.title}>
                <i className={reason.icon} aria-hidden="true" />
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </div>
        </section>

        {Array.isArray(content.team) && content.team.length > 0 && (
          <section className="about-team">
            <div className="about-section-heading">
              <span>THE PEOPLE BEHIND THE PLANS</span>
              <h2>Meet our team.</h2>
            </div>
            <div className="about-team-grid">
              {content.team.map((member, index) => (
                <article key={`${member.name}-${index}`}>
                  {member.photo
                    ? <img src={member.photo} alt={member.name} loading="lazy" />
                    : <div className="about-team-avatar" aria-hidden="true"><i className="ri-user-line" /></div>}
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                  {member.bio && <p>{member.bio}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="about-cta">
          <div><span>YOUR NEXT CHAPTER IS OUT THERE</span><h2>Let’s find your kind of adventure.</h2></div>
          <Link to="/tours">Explore journeys <i className="ri-arrow-right-line" aria-hidden="true" /></Link>
        </section>
      </Container>
    </main>
  );
};

export default About;
