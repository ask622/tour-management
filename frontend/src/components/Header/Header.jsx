import React, { useRef, useEffect, useState,useContext } from "react";
import { Container, Row, Button } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo2.png";
import './header.css';
import {AuthContext} from "./../../context/AuthConstext"

const nav__links = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/about",
    display: "About",
  },
  {
    path: "/tours",
    display: "Tours",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate()
  const {user, dispatch} = useContext(AuthContext)

  const logout = () =>{
    dispatch({type:'LOGOUT'})
    navigate('/')
  }

  const stickyHeaderFunc = () => {
    window.addEventListener('scroll', () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add('sticky__header');
      } else {
        headerRef.current.classList.remove('sticky__header');
      }
    });
  };

  useEffect(() => {
    stickyHeaderFunc();

    // Cleanup function to remove the event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', stickyHeaderFunc);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper d-flex align-items-center justify-content-between">
            {/* =================logo================ */}
            <div className="logo">
              <img src={logo} alt="Logo" />
            </div>
            {/* =================logo end================ */}

            {/* =================menu start================ */}
            <div className={`navigation ${isMobileMenuOpen ? 'active' : ''}`}>
              <ul className="menu d-flex align-items-center gap-5">
                {nav__links.map((item, index) => (
                  <li className="nav__item" key={index}>
                    <NavLink to={item.path} className={(navClass) => (navClass.isActive ? "active__link" : "")}>
                      {item.display}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            {/* =================menu end ================ */}

            <div className="nav__right align-items-center gap-5">
              <div className="nav__btns align-items-center gap-4">
                {user ? (
                  <div className="d-flex align-items-center gap-3">
                    <h6 className="mb-0">{user.username}</h6>
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

              {/* Mobile Menu Toggle */}
              <span className="mobile__menu" onClick={toggleMobileMenu}>
                <i className="ri-menu-line"></i>
              </span>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
