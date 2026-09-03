"use client";

import { useState, type FormEvent } from "react";
import { submitReview } from "@/lib/api/reviews";
import { Star, CheckCircle2, Send } from "lucide-react";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) return;
    const data = new FormData(event.currentTarget);
    await submitReview({
      rating,
      review: data.get("review") as string,
      title: data.get("title") as string,
      userName: data.get("name") as string,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="card" aria-live="polite" style={{ textAlign: "center", padding: "48px 24px" }}>
        <CheckCircle2 size={44} style={{ color: "var(--risk-low)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Feedback Submitted</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 20px" }}>
          Thank you for sharing your experience with HealthLens AI. Your review will be published upon moderation.
        </p>
      </section>
    );
  }

  return (
    <form className="card" onSubmit={submit} style={{ padding: 32 }}>
      <div className="field">
        <label>Overall Experience Rating</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              onClick={() => setRating(value)}
              key={value}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Star
                size={28}
                fill={value <= rating ? "#F59E0B" : "none"}
                stroke={value <= rating ? "#F59E0B" : "#CBD5E1"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label htmlFor="review-name">Display Name (Optional)</label>
        <input id="review-name" name="name" placeholder="e.g. Sarah M." />
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="review-title">Review Headline (Optional)</label>
        <input id="review-title" name="title" placeholder="e.g. Prepared me with great questions for my doctor" />
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="review-text">Detailed Feedback</label>
        <textarea
          id="review-text"
          name="review"
          required
          rows={5}
          placeholder="How did the screening insights help you understand your health markers?"
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

      <button disabled={!rating} className="button button-primary" style={{ marginTop: 24 }} type="submit">
        <Send size={16} /> Submit Patient Review
      </button>
    </form>
  );
}
