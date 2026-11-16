import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/config";
import "./admin.css";

const AdminSetup = () => {
  const [details, setDetails] = useState({ username: "", email: "", password: "", setupKey: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/setup-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not create admin account");
      navigate("/admin/login", { state: { message: result.message } });
    } catch (setupError) {
      setError(setupError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-setup-page">
      <div className="admin-setup-layout">
        <section className="admin-setup-story">
          <Link to="/home" className="admin-brand"><span>Y</span> Yatraventure</Link>
          <div className="admin-setup-story-copy">
            <span className="admin-setup-kicker">THE JOURNEY STARTS HERE</span>
            <h1>Build a place<br />for every next<br /><em>adventure.</em></h1>
            <p>Your private control room for shaping the journeys and community behind Yatraventure.</p>
          </div>
          <div className="admin-setup-orbit" aria-hidden="true"><i className="ri-compass-3-line" /></div>
          <span className="admin-setup-edition">OUTLAND / FIELD OFFICE 01</span>
        </section>

        <form className="admin-setup-card" onSubmit={submit}>
          <span className="admin-eyebrow">PRIVATE ADMIN ACCESS</span>
          <h2>Create your admin account</h2>
          <p>Set up the first administrator. This invitation closes automatically once an admin account exists.</p>
          {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
          <label>Administrator name<input autoComplete="name" required value={details.username} onChange={(e) => setDetails({ ...details, username: e.target.value })} /></label>
          <label>Email address<input autoComplete="email" required type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} /></label>
          <label>Password <span>(at least 8 characters)</span><input autoComplete="new-password" required minLength="8" type="password" value={details.password} onChange={(e) => setDetails({ ...details, password: e.target.value })} /></label>
          <label>Private setup key<input autoComplete="off" required type="password" value={details.setupKey} onChange={(e) => setDetails({ ...details, setupKey: e.target.value })} /></label>
          <button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Creating account…" : "Create admin account"}<i className="ri-arrow-right-line" aria-hidden="true" /></button>
          <div className="admin-setup-footnote"><i className="ri-shield-check-line" aria-hidden="true" /> Your setup key is verified privately by the server.</div>
        </form>
      </div>
    </main>
  );
};

export default AdminSetup;
