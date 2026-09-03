import type { Review } from "./types";

// Marketing testimonials for the public landing page only.
// All patient-facing data (reports, history, analyses) comes from the backend.
export const mockReviews: Review[] = [
  {
    id: "review-1",
    userName: "Amina R.",
    rating: 5,
    title: "Clear and reassuring",
    review:
      "The sample report view made the information much easier to follow without making assumptions about my health.",
    createdAt: "August 2026",
    isVerified: true,
  },
  {
    id: "review-2",
    userName: "Daniel K.",
    rating: 4,
    review:
      "I liked seeing why a model estimate changed and what I could verify in the report.",
    createdAt: "July 2026",
  },
];
