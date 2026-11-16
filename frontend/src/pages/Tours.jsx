import React, { useState, useEffect } from "react";
import CommonSection from "../shared/CommonSection";
import "../styles/tour.css";
import TourCard from "./../shared/TourCard";
import SearchBar from "./../shared/SearchBar";
import Newsletter from "./../shared/Newsletter";
import { Container, Row, Col } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import useFetch from "../hooks/useFatch";
import { BASE_URL } from "../utils/config";

const TOURS_PER_PAGE = 8;

const Tours = () => {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const destinationId = searchParams.get("destinationId") || "";
  const travelDate = searchParams.get("date") || "";
  const travelers = searchParams.get("travelers") || "";
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [appliedSearch, setAppliedSearch] = useState(search);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filterParams = new URLSearchParams({
    ...(categoryId && { categoryId }),
    ...(destinationId && { destinationId }),
    ...(appliedSearch && { search: appliedSearch }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(duration && { duration }),
    ...(minRating && { minRating }),
    ...(travelDate && { date: travelDate }),
    ...(travelers && { travelers }),
    sort,
  });
  const query = filterParams.toString();
  const { data: tours, loading, error } = useFetch(`${BASE_URL}/api/v1/tours?page=${page}&limit=${TOURS_PER_PAGE}&${query}`);
  const { data: tourCount } = useFetch(`${BASE_URL}/api/v1/tours/search/getTourCount?${query}`);
  const { data: categories } = useFetch(`${BASE_URL}/api/v1/categories`);
  const { data: destinations } = useFetch(`${BASE_URL}/api/v1/destinations`);

  useEffect(() => {
    if (tourCount !== null && tourCount !== undefined) {
      setPageCount(Math.ceil(Number(tourCount) / TOURS_PER_PAGE));
    }
    window.scrollTo(0, 0);
  }, [page, tourCount, destinationId, categoryId, appliedSearch, minPrice, maxPrice, duration, minRating, sort]);

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <CommonSection title={"Find your next escape"} />
      <section className="tour-discovery-section">
        <Container>
          <div className="tour-discovery-intro">
            <span>CURATED FOR THE CURIOUS</span>
            <h2>Journeys worth taking.</h2>
            <p>Choose your pace, find your place, and let the mountains do the rest.</p>
          </div>
          <Row className="tour-discovery-search">
            <SearchBar />
          </Row>
          <div className="tour-filter-panel" aria-label="Filter tours">
            <label>
              Search tours
              <input
                type="search"
                placeholder="Destination or tour name"
                value={search}
                onChange={(event) => changeFilter(setSearch, event.target.value)}
              />
            </label>
            <label>
              Category
              <select value={categoryId} onChange={(event) => {
                const nextCategory = event.target.value;
                changeFilter(setCategoryId, nextCategory);
                const next = new URLSearchParams(searchParams);
                if (nextCategory) next.set("categoryId", nextCategory);
                else next.delete("categoryId");
                setSearchParams(next);
              }}>
              <option value="">All experiences</option>
              {(categories || []).map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}
              </select>
            </label>
            <label>
              Destination
              <select value={destinationId} onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) next.set("destinationId", event.target.value);
              else next.delete("destinationId");
              setPage(1);
              setSearchParams(next);
            }}>
              <option value="">All destinations</option>
              {(destinations || []).map((destination) => <option value={destination._id} key={destination._id}>{destination.name}</option>)}
              </select>
            </label>
            <label>
              Min. price
              <input type="number" min="0" placeholder="₹0" value={minPrice} onChange={(event) => changeFilter(setMinPrice, event.target.value)} />
            </label>
            <label>
              Max. price
              <input type="number" min="0" placeholder="No limit" value={maxPrice} onChange={(event) => changeFilter(setMaxPrice, event.target.value)} />
            </label>
            <label>
              Duration
              <select value={duration} onChange={(event) => changeFilter(setDuration, event.target.value)}>
                <option value="">Any length</option>
                <option value="short">1–3 days</option>
                <option value="week">4–7 days</option>
                <option value="long">8+ days</option>
              </select>
            </label>
            <label>
              Rating
              <select value={minRating} onChange={(event) => changeFilter(setMinRating, event.target.value)}>
                <option value="">Any rating</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </Container>
      </section>
      <section className="tour-listing-section">
        <Container>
          {loading && <div className="tour-loading-grid" aria-label="Loading tours">
            {Array.from({ length: 4 }, (_, index) => <div className="tour-loading-card" key={index}><span /><div /></div>)}
          </div>}
          {error && <div className="tour-error-state" role="alert"><i className="ri-wifi-off-line" /><h3>We couldn’t load the journeys.</h3><p>{error}</p></div>}
          {!loading && !error && tours?.length === 0 && (
            <div className="tour-empty-state">
              <i className="ri-compass-3-line" />
              <h3>No journeys match these filters</h3>
              <p>Try adjusting your destination, price or rating to see more options.</p>
            </div>
          )}
          {!loading && !error && tours?.length > 0 && (
            <Row>
              <Col xs="12"><p className="tour-results-count">{tourCount || 0} journeys to explore</p></Col>
              {tours?.map((tour) => (
                <Col lg="3" md="6" sm="12" xs="12" className="mb-4" key={tour._id}>
                  <TourCard tour={tour} />
                </Col>
              ))}
              {pageCount > 1 && <Col lg="12">
                <nav className="pagination d-flex align-items-center justify-content-center mt-4 gap-2" aria-label="Tour pages">
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`tour-page-button ${page === pageNumber ? "active__page" : ""}`}
                      aria-current={page === pageNumber ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </nav>
              </Col>}
            </Row>
          )}
        </Container>
      </section>
      <Newsletter />
    </>
  );
};

export default Tours;
