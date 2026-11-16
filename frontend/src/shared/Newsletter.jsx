import React, { useState } from 'react';
import './newsletter.css';
import { Container, Row, Col } from 'reactstrap';
import maleTourist from '../assets/images/male-tourist.png';
import { BASE_URL } from '../utils/config';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subscribe = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${BASE_URL}/api/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not subscribe right now');
      setSuccess('You’re on the list. Look out for your next travel note.');
      setEmail('');
    } catch (subscribeError) {
      setError(subscribeError.message || 'Could not subscribe right now');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="newsletter">
      <Container>
        <Row>
          <Col lg="6">
            <div className="newsletter__content">
              <h2>Stay Updated with Uttarakhand Travel Insights!</h2>
              <form className="newsletter__input" onSubmit={subscribe}>
                <input
                  type="email"
                  placeholder="Enter your email for exclusive travel updates"
                  autoComplete="email"
                  maxLength="254"
                  required
                  aria-label="Email address for newsletter"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={saving}
                />
                <button className="btn newsletter__btn" type="submit" disabled={saving}>
                  {saving ? 'Joining…' : 'Subscribe'}
                </button>
              </form>
              {error && <p className="newsletter__message newsletter__message--error" role="alert">{error}</p>}
              {success && <p className="newsletter__message newsletter__message--success" role="status">{success}</p>}
              <p>
                Get the latest updates on Uttarakhand’s best travel destinations, adventure activities, and special discounts. Join our community and make your journey memorable!
              </p>
            </div>
          </Col>
          <Col lg="6">
            <div className="newsletter__img">
              <img src={maleTourist} alt="Travel Enthusiast" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Newsletter;
