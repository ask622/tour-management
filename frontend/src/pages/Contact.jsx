import React, { useContext, useState } from "react";
import { Container } from "reactstrap";
import { AuthContext } from "../context/AuthConstext";
import { BASE_URL } from "../utils/config";
import useFetch from "../hooks/useFatch";
import "./contact.css";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "" };

const Contact = () => {
  const { user } = useContext(AuthContext);
  const { data: contactContent } = useFetch(`${BASE_URL}/api/v1/site-content/contact`);
  const contact = contactContent || {};
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: user?.username || "",
    email: user?.email || "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${BASE_URL}/api/v1/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not send your enquiry");
      setSuccess(result.message || "Your enquiry has been sent.");
      setForm({ ...initialForm, name: user?.username || "", email: user?.email || "" });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <main className="contact-page">
      <Container>
        <div className="contact-intro">
          <span>LET'S PLAN SOMETHING GOOD</span>
          <h1>Tell us where<br />you want to go.</h1>
          <p>Questions about a tour or a custom trip? Send us a note and our team will follow up.</p>
        </div>
        <div className="contact-layout">
          <aside className="contact-details">
            <span className="ri-compass-3-line" aria-hidden="true" />
            <h2>Every great journey starts with a conversation.</h2>
            <p>Share a few details and we’ll help you find the right experience.</p>
            <div><i className="ri-mail-line" /> {contact.email || "yatra525@gmail.com"}</div>
            {contact.phone && <div><i className="ri-phone-line" /> {contact.phone}</div>}
            <div><i className="ri-map-pin-line" /> {contact.address || "Bijnor, Uttar Pradesh, India"}</div>
            {Object.entries(contact.socialLinks || {}).filter(([, url]) => Boolean(url)).length > 0 && (
              <div className="contact-social-links" aria-label="Social media">
                {Object.entries(contact.socialLinks).filter(([, url]) => Boolean(url)).map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>
                    <i className={`ri-${name.toLowerCase()}-line`} />
                  </a>
                ))}
              </div>
            )}
          </aside>
          <form className="contact-form" onSubmit={submit}>
            <div className="contact-fields">
              <label>Your name<input name="name" autoComplete="name" maxLength="120" required value={form.name} onChange={change} /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" maxLength="254" required value={form.email} onChange={change} /></label>
              <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength="40" value={form.phone} onChange={change} /></label>
              <label>Subject<input name="subject" maxLength="160" required value={form.subject} onChange={change} /></label>
              <label className="contact-field-wide">How can we help?<textarea name="message" rows="5" maxLength="5000" required value={form.message} onChange={change} /></label>
            </div>
            {error && <p className="contact-error" role="alert">{error}</p>}
            {success && <p className="contact-success" role="status">{success}</p>}
            <button type="submit" disabled={saving}>{saving ? "Sending…" : "Send enquiry"} <i className="ri-arrow-right-line" /></button>
          </form>
        </div>
        <section className="contact-faq" aria-labelledby="contact-faq-title">
          <div>
            <span>GOOD TO KNOW</span>
            <h2 id="contact-faq-title">A few quick answers.</h2>
          </div>
          <div className="contact-faq-list">
            <details>
              <summary>When is my trip confirmed?</summary>
              <p>Your booking starts as a request. Our team will review availability and follow up before your trip is confirmed.</p>
            </details>
            <details>
              <summary>Can I cancel a booking request?</summary>
              <p>You can cancel a pending request from My trips. For confirmed bookings, contact our team so we can review the applicable arrangements.</p>
            </details>
            <details>
              <summary>How do I pay?</summary>
              <p>Online payment is not currently enabled. Payment instructions are shared after your booking request has been reviewed.</p>
            </details>
          </div>
        </section>
      </Container>
    </main>
  );
};

export default Contact;
