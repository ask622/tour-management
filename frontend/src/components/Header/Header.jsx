import React, { useRef, useEffect, useState, useContext } from "react";
import { Container, Row, Button } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo2.png";
import "./header.css";
import { AuthContext } from "../../context/AuthConstext";
import { BASE_URL } from "../../utils/config";

const baseNavLinks = [
  { path: "/home", display: "Home" },
  { path: "/about", display: "About" },
  { path: "/tours", display: "Tours" },
  { path: "/contact", display: "Contact" },
];

const Header = ({ settings = {} }) => {
  const headerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const nav__links = user
    ? [...baseNavLinks, { path: "/account", display: "My trips" }, ...(user.role === "admin" ? [{ path: "/admin", display: "Admin" }] : [])]
    : baseNavLinks;

  const logout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Could not end the server session.");
    } catch (error) {
      window.alert(error.message);
    } finally {
      dispatch({ type: "LOGOUT" });
      navigate("/");
    }
  };

  // Sticky header logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link to="/home" className="logo" aria-label="Go to home">
              <img src={settings.logo || logo} alt={settings.websiteName || "Yatraventure"} />
              {settings.websiteName && <span className="header-brand-name">{settings.websiteName}</span>}
            </Link>

            {/* Navigation */}
            <div className={`navigation ${isMobileMenuOpen ? "active" : ""}`}>
              <ul id="site-navigation" className={`menu ${isMobileMenuOpen ? "active" : ""}`}>
                {nav__links.map((item, index) => (
                  <li className="nav__item" key={index}>
                    <NavLink
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        isActive ? "active__link" : ""
                      }
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side */}
            <div className="nav__right d-flex align-items-center gap-4">
              <div className="nav__btns d-flex align-items-center gap-3">
                {user ? (
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">{user.username}</h6>
                    {user.role === "admin" && (
                      <Button className="btn btn-dark" onClick={() => navigate("/admin")}>
                        Admin
                      </Button>
                    )}
                    <Button className="btn btn-dark" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button className="btn secondary__btn">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="btn primary__btn">
                      <Link to="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Toggle Icon */}
              <button
                type="button"
                className="mobile__menu"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="site-navigation"
              >
                <i className={isMobileMenuOpen ? "ri-close-line" : "ri-menu-line"} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
