// Module-level bridge so the axios request interceptor (non-React code)
// can read the current Clerk session token. Kept in sync by AuthProvider.
let clerkToken: string | null = null;

export function setClerkToken(token: string | null) {
  clerkToken = token;
}

export function getClerkToken(): string | null {
  return clerkToken;
}
