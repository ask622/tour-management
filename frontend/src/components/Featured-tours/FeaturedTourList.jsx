import React, { useEffect, useState } from "react";
import TourCard from "../../shared/TourCard";
import { Col } from "reactstrap";
import { BASE_URL } from "../../utils/config";

const FeaturedTourList = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const url = `${BASE_URL}/api/v1/tours/search/getFeaturedTour`; // Corrected endpoint

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // console.log("Fetching data from:", url); // Debug log
        const res = await fetch(url);
        if (!res.ok) {
          setError("Failed to fetch data");
        }
        const result = await res.json();
        // console.log("API Response:", result); // Debug log
        setData(result.data || []); // Handle empty response
        // console.log("Data set in state:", result.data || []); // Debug log
      } catch (err) {
        console.error("Fetch Error:", err.message); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  if (loading) {
    // console.log("Loading data..."); // Debug log
    return <h4>Loading...</h4>;
  }
  if (error) {
    console.error("Error occurred:", error); // Debug log
    return <h4>{error}</h4>;
  }
  if (!data || data.length === 0) {
    console.log("No featured tours found"); // Debug log
    return <h4>No featured tours found</h4>;
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