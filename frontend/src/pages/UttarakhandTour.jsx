import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import "leaflet-extra-markers/dist/js/leaflet.extra-markers";

// Custom icons for different places
const icons = {
  mountain: L.ExtraMarkers.icon({
    icon: "fa-mountain",
    markerColor: "blue",
    shape: "circle",
    prefix: "fa",
  }),
  temple: L.ExtraMarkers.icon({
    icon: "fa-place-of-worship",
    markerColor: "red",
    shape: "square",
    prefix: "fa",
  }),
  river: L.ExtraMarkers.icon({
    icon: "fa-water",
    markerColor: "green",
    shape: "star",
    prefix: "fa",
  }),
};

// Directly using locations in the component
const places = [
  {
    name: "Nainital",
    lat: 29.3919,
    lng: 79.4542,
    type: "mountain",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Nainital_Lake.jpg",
    desc: "A beautiful hill station with a famous lake.",
  },
  {
    name: "Mussoorie",
    lat: 30.459,
    lng: 78.0642,
    type: "mountain",
    img: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Mussoorie_Hills.jpg",
    desc: "The Queen of Hills, a perfect getaway.",
  },
  {
    name: "Rishikesh",
    lat: 30.0869,
    lng: 78.2676,
    type: "river",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/72/Lakshman_Jhula_Rishikesh.jpg",
    desc: "The yoga capital of the world.",
  },
  {
    name: "Haridwar",
    lat: 29.9457,
    lng: 78.1642,
    type: "river",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Haridwar_Har_Ki_Pauri.jpg",
    desc: "A sacred city on the banks of the Ganges.",
  },
  {
    name: "Kedarnath",
    lat: 30.7352,
    lng: 79.0669,
    type: "temple",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Kedarnath_Temple.jpg",
    desc: "One of the 12 Jyotirlingas of Lord Shiva.",
  },
  {
    name: "Badrinath",
    lat: 30.744,
    lng: 79.493,
    type: "temple",
    img: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Badrinath_Temple.jpg",
    desc: "A sacred temple dedicated to Lord Vishnu.",
  },
];

const UttarakhandTour = () => {
  return (
    <div style={{ height: "500px", width: "100%", marginTop: "20px", borderRadius: "10px", overflow: "hidden", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
      <MapContainer center={[30.0668, 79.0193]} zoom={8} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        {/* Light mode map style */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {places.map((place, index) => (
          <Marker key={index} position={[place.lat, place.lng]} icon={icons[place.type]}>
            <Popup>
              <div style={{ textAlign: "center" }}>
                <img
                  src={place.img}
                  alt={place.name}
                  style={{ width: "120px", height: "80px", borderRadius: "5px" }}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/120x80?text=No+Image")}
                />
                <h4>{place.name}</h4>
                <p style={{ fontSize: "14px", color: "#666" }}>{place.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UttarakhandTour;
