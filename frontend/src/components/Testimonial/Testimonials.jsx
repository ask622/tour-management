import React from "react";
import Slider from "react-slick";
import ava01 from "../../assets/images/ava-1.jpg";
import ava02 from "../../assets/images/ava-2.png";
import ava03 from "../../assets/images/ava-3.png";

const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    swipeToSlide: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,

    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {/* Testimonial 1 */}
      <div className="testimonial py-4 px-3">
        <p>
          "My trip was fantastic! Everything was well-organized, and I enjoyed every moment."
        </p>
        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava01} className="w-25 h-25 rounded-2" alt="Jaiveer Singh" />
          <div>
            <h6 className="mb-0 mt-3">Jaiveer Singh</h6>
            <p>Traveler</p>
          </div>
        </div>
      </div>

      {/* Testimonial 2 */}
      <div className="testimonial py-4 px-3">
        <p>
          "Highly professional service! The tour was smooth, and the team was very supportive."
        </p>
        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava02} className="w-25 h-25 rounded-2" alt="Harsh Barman" />
          <div>
            <h6 className="mb-0 mt-3">Harsh Barman</h6>
            <p>Adventure Enthusiast</p>
          </div>
        </div>
      </div>

      {/* Testimonial 3 */}
      <div className="testimonial py-4 px-3">
        <p>
          "One of the best travel experiences! I can't wait to book my next trip."
        </p>
        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava03} className="w-25 h-25 rounded-2" alt="Aakash Saini" />
          <div>
            <h6 className="mb-0 mt-3">Aakash Saini</h6>
            <p>Solo Traveler</p>
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default Testimonials;
