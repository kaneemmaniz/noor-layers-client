import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

const CONTACT_INFO = [
  {
    label: "Email",
    value: "noorlayers@gmail.com.com",
    link: "mailto:noorlayers@gmail.com.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+234 8120970774",
    link: "tel:+2348120970774",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
  },
  {
    label: "Address",
    value: "Lagos, Nigeria",
    link: "https://maps.google.com/?q=Lagos+Nigeria",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    label: "Hours",
    value: "Mon - Fri: 9:00 AM - 6:00 PM",
    link: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API call - replace with your actual endpoint
    try {
      // await axios.post('/contact', form);
      await new Promise(r => setTimeout(r, 1200));
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="nl-contact-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li className="active">Contact Us</li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="nl-h1">Contact Us</h1>
        <p className="nl-contact-intro">
          We'd love to hear from you. Whether you have a question or just want to say 
          hello, we're here for you.
        </p>

        <div className="row g-4 mt-3">
          {/* LEFT: Contact Info */}
          <div className="col-12 col-lg-5">
            <div className="nl-eyebrow">GET IN TOUCH</div>
            <h2 className="nl-h2 mt-2 mb-4">
              We'd love to hear<br />
              from <em>you.</em>
            </h2>

            <div className="nl-contact-cards">
              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="nl-contact-card">
                  <div className="nl-contact-card__icon">
                    {info.icon}
                  </div>
                  <div className="nl-contact-card__body">
                    <div className="nl-contact-card__label">{info.label}</div>
                    {info.link ? (
                      <a href={info.link} className="nl-contact-card__value">
                        {info.value}
                      </a>
                    ) : (
                      <div className="nl-contact-card__value">{info.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="nl-contact-social">
              <span>Follow us</span>
              <div className="nl-contact-social__icons">
                {[
                  { l: "Instagram", d: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2C5.2 4 4 5.2 4 7.6v8.8C4 18.8 5.2 20 7.6 20h8.8c2.4 0 3.6-1.2 3.6-3.6V7.6C20 5.2 18.8 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" },
                  { l: "WhatsApp", d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" },
                  { l: "TikTok", d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" },
                  { l: "Facebook", d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                ].map(({ l, d }) => (
                  <a key={l} href="#" className="nl-soc-icon" aria-label={l}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d={d}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Message Form */}
          <div className="col-12 col-lg-7">
            <div className="nl-message-card">
              <h3 className="nl-message-title">Send us a Message</h3>
              <p className="nl-message-sub">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {sent ? (
                <div className="nl-message-success">
                  <div className="nl-success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="40" height="40">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h4>Message Sent!</h4>
                  <p>Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="nl-message-form">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className="nl-form-input"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                        className="nl-form-input"
                      />
                    </div>
                    <div className="col-12">
                      <label className="nl-form-label">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Subject"
                        required
                        className="nl-form-input"
                      />
                    </div>
                    <div className="col-12">
                      <label className="nl-form-label">Your Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Your Message"
                        rows="6"
                        required
                        className="nl-form-input nl-form-textarea"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn nl-btn nl-btn-send" disabled={sending}>
                    {sending ? (
                      <>
                        <span className="nl-spinner" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}