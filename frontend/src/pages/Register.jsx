import React, { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import registerImg from '../assets/images/register.png';
import userIcon from '../assets/images/user.png';
import { BASE_URL } from './../utils/config';

const Register = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${BASE_URL}/api/v1/auth/registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials) // Use the state variable here
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Could not create your account');
            setSuccess(result.message || 'Your account has been created. You can now sign in.');
        } catch (err) {
            setError(err.message || 'Could not create your account');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section>
            <Container>
                <Row>
                    <Col lg="8" className="m-auto">
                        <div className="login__container d-flex justify-content-between">
                            <div className="login__img">
                                <img src={registerImg} alt="" />
                            </div>
                            <div className="login__form">
                                <div className="user">
                                    <img src={userIcon} alt="" />
                                </div>
                                <h2>Register</h2>
                                <Form onSubmit={handleClick}>
                                    <FormGroup>
                                        <input
                                            type="text"
                                            placeholder="User Name"
                                            required
                                            id="username"
                                            minLength="2"
                                            maxLength="80"
                                            onChange={handleChange}
                                            value={credentials.username}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            required
                                            id="email"
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <input
                                        type={passwordVisible ? 'text' : 'password'}
                                            placeholder="Password"
                                            required
                                        id="password"
                                        minLength="8"
                                        autoComplete="new-password"
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
                                    <Button className="btn secondary__btn auth__btn" type="submit" disabled={saving}>
                                    {saving ? 'Creating account…' : 'Create Account'}
                                    </Button>
                                </Form>
                                {error && <p className="auth-error" role="alert">{error}</p>}
                                {success && <p className="auth-success" role="status">{success}</p>}
                                <p>
                                    Already have an account? <Link to="/login">Login</Link>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Register;