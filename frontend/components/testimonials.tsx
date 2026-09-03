import type { Review } from "@/lib/types";
import { Star, CheckCircle2 } from "lucide-react";

export function Testimonials({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="wrap" style={{ padding: "80px 0" }}>
      <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
        <span style={{ color: "var(--blue-primary)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Patient Experiences
        </span>
        <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", marginTop: 8, marginBottom: 12 }}>
          Trusted by patients & proactive individuals
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Real feedback on how HealthLens AI provided clarity ahead of clinical doctor consultations.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {reviews.map((review) => (
          <article
            className="card"
            key={review.id}
            style={{
              padding: 28,
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 4, color: "#F59E0B", marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < review.rating ? "#F59E0B" : "none"}
                    stroke={i < review.rating ? "#F59E0B" : "#CBD5E1"}
                  />
                ))}
              </div>

              {review.title && (
                <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "var(--text-primary)" }}>
                  {review.title}
                </h3>
              )}
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.55, marginBottom: 20 }}>
                &ldquo;{review.review}&rdquo;
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: 14, fontSize: "0.8rem" }}>
              <strong style={{ color: "var(--text-primary)" }}>{review.userName}</strong>
              {review.isVerified && (
                <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>
                  <CheckCircle2 size={12} /> Verified Patient
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
