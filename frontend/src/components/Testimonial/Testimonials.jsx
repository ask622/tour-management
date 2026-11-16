import React from "react";
import Slider from "react-slick";
import ava01 from "../../assets/images/ava-1.jpg";
import ava02 from "../../assets/images/ava-2.png";
import ava03 from "../../assets/images/ava-3.png";

const defaultTestimonials = [
  { name: "Jaiveer Singh", quote: "My trip was fantastic! Everything was well-organized, and I enjoyed every moment.", location: "Traveler" },
  { name: "Harsh Barman", quote: "Highly professional service! The tour was smooth, and the team was very supportive.", location: "Adventure enthusiast" },
  { name: "Aakash Saini", quote: "One of the best travel experiences! I can't wait to book my next trip.", location: "Solo traveler" },
];

const avatars = [ava01, ava02, ava03];

const Testimonials = ({ items }) => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    swipeToSlide: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true, dots: true } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };
  const testimonials = items === undefined ? defaultTestimonials : items;

  if (!testimonials.length) return null;

  return (
    <Slider {...settings}>
      {testimonials.map((item, index) => (
        <div className="testimonial py-4 px-3" key={`${item.name}-${index}`}>
          <p>“{item.quote}”</p>
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={avatars[index % avatars.length]} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">{item.name}</h6>
              <p>{item.location || "Traveler"}{item.rating ? ` · ${item.rating}/5` : ""}</p>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default Testimonials;
