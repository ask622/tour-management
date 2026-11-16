import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import loginImg from '../assets/images/login.png';
import userIcon from '../assets/images/user.png';

import { AuthContext } from './../context/AuthConstext';
import { BASE_URL } from './../utils/config'; // should be correctly set

const Login = ({ adminOnly = false }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const { dispatch, isFetching, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN_START' });

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/${adminOnly ? 'admin-login' : 'login'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Only if you’re using cookies/sessions
        body: JSON.stringify(credentials)
      });

      const result = await res.json();

      if (res.ok) {
        if (adminOnly && result.data?.role !== 'admin') {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'This account does not have administrator access' });
          return;
        }
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.data });
        navigate(adminOnly ? '/admin' : result.data?.role === 'admin' ? '/admin' : '/home');
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.message });
      }
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="login__img">
                <img src={loginImg} alt="login" />
              </div>
              <div className="login__form">
                <div className="user">
                  <img src={userIcon} alt="user" />
                </div>
                <h2>{adminOnly ? 'Administrator sign in' : 'Login'}</h2>
                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      id="email"
                      autoComplete="email"
                      onChange={handleChange}
                      value={credentials.email}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Password"
                      required
                      id="password"
                      autoComplete="current-password"
                      onChange={handleChange}
                      value={credentials.password}
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      aria-pressed={passwordVisible}
                    >
                      <i className={passwordVisible ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                    </button>
                  </FormGroup>
                  <Button
                    className="btn secondary__btn auth__btn"
                    type="submit"
                    disabled={isFetching}
                  >
                    {isFetching ? 'Signing in…' : adminOnly ? 'Sign in to admin' : 'Login'}
                  </Button>
                </Form>
                {error && <p className="auth-error" role="alert">{error}</p>}
                {adminOnly ? (
                  <p><Link to="/home">Return to the website</Link></p>
                ) : (
                  <p>Don't have an account? <Link to="/register">Create</Link></p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
