import { mockReviews } from "../mock-data"; import type { Review, ReviewSubmission } from "../types";
export async function getApprovedReviews(): Promise<Review[]> { return mockReviews; }
export async function submitReview(submission: ReviewSubmission): Promise<{ status: "pending" }> { void submission; return { status: "pending" }; }
