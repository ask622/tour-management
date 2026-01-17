import React from 'react'
import './Service-card.css';

const ServiceCard = ({item}) => {
    const {imgUrl, title,desc} = item
  return <div className="service__item">
    <div className="service__img">
        <img src={imgUrl} alt="" />
    </div>
    <h4>{title}</h4>
    <h5>{desc}</h5>
  </div>
}

export default ServiceCard