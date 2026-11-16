import React from "react";
import "./footer.css";
import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import useFetch from "../../hooks/useFatch";
import { BASE_URL } from "../../utils/config";

const quick__links = [
  { path: "/home", display: "Home" },
  { path: "/about", display: "About Us" },
  { path: "/tours", display: "Tour Packages" },
  { path: "/contact", display: "Contact" },
];

const quick__links2 = [
  { path: "/Gallery", display: "Gallery" },
  { path: "/login", display: "Login" },
  { path: "/register", display: "Register" },
];

const Footer = ({ settings = {} }) => {
  const { data: footerContent } = useFetch(`${BASE_URL}/api/v1/site-content/footer`);
  const { data: contactContent } = useFetch(`${BASE_URL}/api/v1/site-content/contact`);
  const footer = footerContent || {};
  const contact = contactContent || {};
  const socialLinks = Object.keys(footer.socialLinks || {}).length
    ? footer.socialLinks
    : contact.socialLinks || {};

  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg="3">
            <div className="logo">
              <img src={settings.logo || logo} alt={`${settings.websiteName || "Yatraventure"} logo`} />
              <p>{footer.description || "Explore the untouched beauty of Uttarakhand with Yatraventure. Your journey, our commitment!"}</p>
              <div className="social__links d-flex align-items-center gap-4">
                {Object.entries(socialLinks).filter(([, url]) => Boolean(url)).map(([name, url]) => (
                  <span key={name}><a href={url} target="_blank" rel="noreferrer" aria-label={name}><i className={`ri-${name.toLowerCase()}-line`} /></a></span>
                ))}
              </div>
            </div>
          </Col>

          <Col lg="3">
            <h5 className="footer__link-title">Explore Uttarakhand</h5>
            <ListGroup className="footer__quick-links">
              {quick__links.map((item, index) => (
                <ListGroupItem key={index} className="ps-0 border-0">
                  <Link to={item.path}>{item.display}</Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col lg="3">
            <h5 className="footer__link-title">Quick Links</h5>
            <ListGroup className="footer__quick-links">
              {(footer.usefulLinks?.length ? footer.usefulLinks : quick__links2).map((item, index) => {
                const target = item.path || item.url || "/home";
                const label = item.display || item.label;
                return (
                  <ListGroupItem key={item.url || item.path || label || index} className="ps-0 border-0">
                    {/^(https?:\/\/|mailto:|tel:)/i.test(target) ? <a href={target} target={/^https?:\/\//i.test(target) ? "_blank" : undefined} rel={/^https?:\/\//i.test(target) ? "noreferrer" : undefined}>{label}</a> : <Link to={target}>{label}</Link>}
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </Col>

          <Col lg="3">
            <h5 className="footer__link-title">Contact</h5>
            <ListGroup className="footer__quick-links">
              <ListGroupItem className="ps-0 border-0 d-flex align-items-center gap-3">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <span><i className="ri-map-pin-line"></i></span>
                  Address:
                </h6>
                <p className="mb-0">{contact.address || "Bijnor, Uttar Pradesh"}</p>
              </ListGroupItem>
              <ListGroupItem className="ps-0 border-0 d-flex align-items-center gap-3">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <span><i className="ri-mail-line"></i></span>
                  Email:
                </h6>
                <p className="mb-0">{contact.email || "yatra525@gmail.com"}</p>
              </ListGroupItem>
              <ListGroupItem className="ps-0 border-0 d-flex align-items-center gap-3">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <span><i className="ri-phone-fill"></i></span>
                  Phone:
                </h6>
                <p className="mb-0">{contact.phone || "+91 1234567890"}</p>
              </ListGroupItem>
            </ListGroup>
          </Col>

          
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
