"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [isSent, setIsSent] = useState(false);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSent(true);
  }

  if (isSent) {
    return (
      <section className="card" aria-live="polite" style={{ textAlign: "center", padding: "48px 24px" }}>
        <CheckCircle2 size={44} style={{ color: "var(--risk-low)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Message Received</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 20px" }}>
          Thank you for reaching out to the HealthLens clinical team. We will review your inquiry shortly.
        </p>
      </section>
    );
  }

  return (
    <form className="card" onSubmit={submitMessage} style={{ padding: 32 }}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-name">Your Full Name</label>
          <input id="contact-name" name="name" placeholder="Dr. John Smith / Jane Doe" required />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email Address</label>
          <input id="contact-email" name="email" type="email" placeholder="you@hospital.com" required />
        </div>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="contact-message">Inquiry or Clinical Feedback</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Describe your inquiry, bug report, or clinical trial feedback..."
          style={{
            border: "1px solid var(--border-medium)",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: "0.9rem",
            fontFamily: "var(--font-body)",
            resize: "vertical",
          }}
        />
      </div>

      <button className="button button-primary" style={{ marginTop: 24 }} type="submit">
        <Send size={16} /> Send Inquiry
      </button>
    </form>
  );
}
