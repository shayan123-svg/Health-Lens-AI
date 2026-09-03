import json
import os
import time
import urllib.request

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# CONFIG
# ==========================================

# Clerk issuer URL, e.g. https://your-app.clerk.accounts.dev
# (the "Issuer" value from Clerk Dashboard -> JWT Templates,
# or https://<frontend-api>.clerk.accounts.dev by default)
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "").rstrip("/")

bearer_scheme = HTTPBearer(auto_error=False)


# ==========================================
# CLERK JWKS CACHE
# ==========================================

_JWKS_TTL_SECONDS = 300

_jwks_cache: dict = {
    "keys": {},
    "fetched_at": 0.0,
}


def _fetch_clerk_jwks(force_refresh: bool = False) -> dict[str, dict]:
    """
    Fetch Clerk's JSON Web Key Set and cache it for 5 minutes.
    Returns a mapping of key-id -> JWK dict.
    """

    now = time.time()

    if (
        not force_refresh
        and _jwks_cache["keys"]
        and now - _jwks_cache["fetched_at"] < _JWKS_TTL_SECONDS
    ):
        return _jwks_cache["keys"]

    if not CLERK_ISSUER:
        raise ValueError("CLERK_ISSUER is not configured.")

    jwks_url = f"{CLERK_ISSUER}/.well-known/jwks.json"

    request = urllib.request.Request(
        jwks_url,
        headers={"User-Agent": "HealthLensAI/1.0"},
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        payload = json.loads(response.read().decode("utf-8"))

    keys = {
        key["kid"]: key
        for key in payload.get("keys", [])
        if key.get("kid")
    }

    _jwks_cache["keys"] = keys
    _jwks_cache["fetched_at"] = now

    return keys


def _get_clerk_public_key(kid: str):
    """Resolve a Clerk public key by key id, refreshing the cache once on miss."""

    for attempt in range(2):
        keys = _fetch_clerk_jwks(force_refresh=attempt > 0)
        jwk = keys.get(kid)
        if jwk:
            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

    return None


def _verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk session JWT (RS256) against Clerk's JWKS.
    Returns the decoded claims or raises jwt exceptions.
    """

    try:
        header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token. Please sign in again.",
        ) from exc

    kid = header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing a key id. Please sign in again.",
        )

    public_key = _get_clerk_public_key(kid)
    if public_key is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the authentication provider. Try again shortly.",
        )

    options = {"verify_aud": False}
    decode_kwargs = {}
    if CLERK_ISSUER:
        decode_kwargs["issuer"] = CLERK_ISSUER

    return jwt.decode(
        token,
        key=public_key,
        algorithms=["RS256"],
        options=options,
        **decode_kwargs,
    )


# ==========================================
# CURRENT USER DEPENDENCY
# ==========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency.
    Validates the Clerk session JWT and returns the user identity.

    Requires: Authorization: Bearer <clerk_session token>
    """

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization token. Please sign in.",
        )

    token = credentials.credentials

    try:
        payload = _verify_clerk_token(token)
    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token: " + str(exc),
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not identify a user.",
        )

    return {
        "user_id": user_id,
        # 'email' is available if added to the Clerk session-token claims
        # (Clerk Dashboard -> JWT Templates -> Session token claims)
        "email": payload.get("email"),
    }


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    """
    Optional user dependency. Returns user dict if valid token provided, else None.
    """

    if not credentials or not credentials.credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None
