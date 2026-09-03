"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useClerk,
} from "@clerk/clerk-react";
import { setClerkToken } from "./clerk-token";
import { apiClient } from "./api/axios-client";

// ==========================================
// TYPES (shape preserved from the previous Supabase-backed context)
// ==========================================

export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata: { full_name: string | null };
}

export interface AuthSession {
  access_token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  /** True while Clerk is loading the initial session state. */
  loading: boolean;
  /** True once Clerk confirms a signed-in session (token may still be loading). */
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}

// ==========================================
// CONTEXT
// ==========================================

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isSignedIn: false,
  signOut: async () => {},
});

// Clerk session tokens are short-lived (~60s), so refresh ahead of expiry.
const TOKEN_REFRESH_MS = 50_000;

// ==========================================
// PROVIDER
// ==========================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();

  const [token, setToken] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // User ids already synced to the backend database this session.
  const syncedUserIds = useRef<Set<string>>(new Set());

  const userId = clerkUser?.id ?? null;
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const fullName = clerkUser?.fullName ?? null;

  // Keep a fresh Clerk JWT available for API calls.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setToken(null);
      setClerkToken(null);
      return;
    }

    let active = true;

    const loadToken = async () => {
      try {
        const fresh = await getTokenRef.current();
        if (!active) return;
        setToken(fresh);
        setClerkToken(fresh);
      } catch {
        if (!active) return;
        setToken(null);
        setClerkToken(null);
      }
    };

    loadToken();
    const interval = setInterval(loadToken, TOKEN_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn]);

  // Register the Clerk user in the backend database (idempotent upsert).
  // Retries on each token refresh until it succeeds.
  useEffect(() => {
    if (!isSignedIn || !userId || !token || syncedUserIds.current.has(userId)) {
      return;
    }
    apiClient
      .post("/api/v1/auth/sync", { email, full_name: fullName })
      .then(() => syncedUserIds.current.add(userId))
      .catch(() => {});
  }, [isSignedIn, userId, token, email, fullName]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const user: AuthUser | null =
    isSignedIn && clerkUser
      ? { id: clerkUser.id, email, user_metadata: { full_name: fullName } }
      : null;

  const session: AuthSession | null =
    isSignedIn && token ? { access_token: token } : null;

  return (
    <AuthContext.Provider value={{ user, session, loading: !isLoaded, isSignedIn: Boolean(isSignedIn), signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

/**
 * Access the current auth state from any client component.
 *
 * @example
 * const { user, loading, signOut } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
