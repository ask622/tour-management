import React, { useState, useEffect } from "react";
import CommonSection from "../shared/CommonSection";
import "../styles/tour.css";
import TourCard from "./../shared/TourCard";
import SearchBar from "./../shared/SearchBar";
import Newsletter from "./../shared/Newsletter";
import { Container, Row, Col } from "reactstrap";
import useFetch from "../hooks/useFatch";
import { BASE_URL } from "../utils/config";

const Tours = () => {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);

  // Fetch tours with pagination
  const { data: tours, loading, error } = useFetch(`${BASE_URL}/api/v1/tours?page=${page}`, [page]);
  const { data: tourCount } = useFetch(`${BASE_URL}/api/v1/tours/search/getTourCount`);

  useEffect(() => {
    if (tourCount) {
      const pages = Math.ceil(tourCount / 5); // Assuming 8 tours per page
      // console.log("Total Pages:", pages); // Debug log
      setPageCount(pages);
    }
    window.scrollTo(0, 0); // Scroll to top on page change
  }, [tourCount]);

  // console.log("Current Page:", page); // Debug log
  // console.log("Tours Data:", tours); // Debug log

  return (
    <>
      <CommonSection title={"All Tours"} />
      <section>
        <Container>
          <Row>
            <SearchBar />
          </Row>
        </Container>
      </section>
      <section>
        <Container>
          {loading && <h4 className="text-center pt-5">Loading...</h4>}
          {error && <h4 className="text-center pt-5">{error}</h4>}
          {!loading && !error && (
            <Row>
              {tours?.map((tour) => (
                <Col lg="3" className="mb-4" key={tour._id}>
                  <TourCard tour={tour} />
                </Col>
              ))}
              <Col lg="12">
                <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                  {[...Array(pageCount).keys()].map((number) => (
                    <span
                      key={number}
                      onClick={() => {
                        setPage(number); // Set the correct 0-based page index
                        console.log("Page Changed to:", number); // Debug log
                      }}
                      className={page === number ? "active__page" : ""}
                      style={{ cursor: "pointer" }}
                    >
                      {number + 1} {/* Display 1-based page number */}
                    </span>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </section>
      <Newsletter />
    </>
  );
};

export default Tours;
