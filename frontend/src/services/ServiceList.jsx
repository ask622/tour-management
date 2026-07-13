import React from 'react'
import ServiceCard from './ServiceCard'
import { Col } from "reactstrap"

import weatherImg from '../assets/images/weather.png'
import guideImg from '../assets/images/guide.png'
import customizationImg from '../assets/images/customization.png'

const servicesData = [
    { 
        imgUrl: weatherImg,
        title: "Calculate Weather",
        desc: "Get real-time weather updates for your destination, helping you plan your trip without any surprises."
    },
    {
        imgUrl: guideImg,
        title: "Best Tour Guide",
        desc: "Explore Uttarakhand with expert tour guides who provide rich insights into local culture, history, and hidden gems."
    },
    {
        imgUrl: customizationImg,
        title: "Personalized Trips",
        desc: "Customize your travel experience based on your preferences, including adventure, relaxation, and cultural experiences."
    }
]

const ServiceList = () => {
    return (
        <>
            {servicesData.map((item, index) => (
                <Col lg="3" key={index}>
                    <ServiceCard item={item} />
                </Col>
            ))}
        </>
    )
}

export default ServiceList
