import React, { useEffect, useState } from "react";
import TourCard from "../../shared/TourCard";
import { Col } from "reactstrap";
import { BASE_URL } from "../../utils/config";

const FeaturedTourList = ({ tourIds = [] }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedIds = JSON.stringify(tourIds);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const ids = JSON.parse(selectedIds);
      const url = ids.length
        ? `${BASE_URL}/api/v1/tours?page=1&limit=100`
        : `${BASE_URL}/api/v1/tours/search/getFeaturedTour`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch featured tours");
        const result = await res.json();
        let tours = result.data || [];
        if (ids.length) {
          const byId = new Map(tours.map((tour) => [tour._id, tour]));
          tours = ids.map((id) => byId.get(id)).filter(Boolean);
        }
        if (active) setData(tours);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [selectedIds]);

  if (loading) {
    // console.log("Loading data..."); // Debug log
    return <h4>Loading...</h4>;
  }
  if (error) {
    return <h4>{error}</h4>;
  }
  if (!data || data.length === 0) {
    return null;
  }

  // console.log("Rendering data:", data); // Debug log

  return (
    <>
      {data.map((tour) => (
        <Col lg="3" className="mb-4" key={tour._id}>
          <TourCard tour={tour} />
        </Col>
      ))}
    </>
  );
};

export default FeaturedTourList;