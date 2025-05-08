import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/about.css"; // Ensure CSS is properly linked

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      {/* Header Section */}
      <h2 className="about-title">About Us</h2>

      {/* Main Content */}
      <div className="about-content">
        {/* Left Side - Image */}
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1000&h=600&fit=crop"
            alt="Adventure Travel"
          />
        </div>

        {/* Right Side - Text */}
        <div className="about-text">
          <p>
            Welcome to <strong>YatraVenture</strong>, where adventure meets
            convenience! 🌍 We are passionate about crafting unforgettable
            travel experiences for wanderlust seekers.
          </p>
          <h4>Why Choose Us?</h4>
          <ul>
            <li>✅ Expert Travel Guides</li>
            <li>✅ 100+ Amazing Destinations</li>
            <li>✅ Best Price Guarantee</li>
            <li>✅ 24/7 Customer Support</li>
          </ul>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="extra-section">
        <div className="extra-item">
          <img
            src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1000&h=600&fit=crop"
            alt="Nature Exploration"
          />
          <h3>Explore Stunning Landscapes</h3>
          <p>Join us for breathtaking nature trails and scenic beauty.</p>
        </div>
        <div className="extra-item">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=600&fit=crop"
            alt="Hiking Tourism"
          />
          <h3>Exciting Hiking Tours</h3>
          <p>Discover hidden gems with our professional guides.</p>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="about-cta">
        <h3>Ready to Explore the World? 🌎</h3>
        <p>Join us on an unforgettable journey today!</p>
        <button className="cta-button" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default About;
