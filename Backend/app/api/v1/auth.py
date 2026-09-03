from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.schemas.auth import UserSyncRequest
from app.services.user_service import upsert_user

router = APIRouter()


# ==========================================
# Authentication model
# ==========================================
#
# Sign-up, sign-in, sessions, and password resets are handled entirely by
# Clerk on the frontend. The backend's only responsibilities are:
#   1. Verify Clerk session tokens on protected routes (app/core/auth.py).
#   2. Mirror the authenticated identity into the `users` table.


# ==========================================
# GET CURRENT USER
# ==========================================

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    """
    Return the authenticated user's identity and mirror it into the
    users table. Requires: Authorization: Bearer <clerk session token>
    """

    upsert_user(
        user_id=user["user_id"],
        email=user.get("email"),
    )

    return {
        "user_id": user["user_id"],
        "email": user.get("email"),
    }


# ==========================================
# SYNC USER PROFILE
# ==========================================

@router.post("/sync")
def sync_user(
    body: UserSyncRequest,
    user: dict = Depends(get_current_user),
):
    """
    Persist Clerk profile details (email, name) for the authenticated user.

    The frontend calls this once after sign-in, passing the profile fields
    from Clerk's useUser(). The user_id always comes from the verified
    token — clients can never write to another user's record.
    """

    row = upsert_user(
        user_id=user["user_id"],
        email=user.get("email") or body.email,
        full_name=body.full_name,
    )

    return {
        "message": "User synced successfully.",
        "user_id": user["user_id"],
        "user": row,
    }
