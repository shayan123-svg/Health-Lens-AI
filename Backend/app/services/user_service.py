from app.core.supabase import supabase


TABLE_NAME = "users"


# Expected Supabase table (run once in the Supabase SQL editor):
#
#   create table if not exists public.users (
#     user_id text primary key,
#     email text,
#     full_name text,
#     created_at timestamptz not null default now(),
#     last_seen_at timestamptz not null default now()
#   );
#
# Clerk is the source of truth for authentication; this table simply mirrors
# the identities that have authenticated, keyed by the Clerk user id.


def upsert_user(
    user_id: str,
    email: str | None = None,
    full_name: str | None = None,
) -> dict | None:
    """
    Insert or update the Clerk-authenticated user in the users table.

    Returns the stored row, or None if persistence failed (authentication
    itself must never be blocked by a bookkeeping write).
    """

    payload: dict = {"user_id": user_id}

    if email:
        payload["email"] = email
    if full_name:
        payload["full_name"] = full_name

    try:
        response = (
            supabase
            .table(TABLE_NAME)
            .upsert(payload, on_conflict="user_id")
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as exc:
        print(f"[user_service] Failed to upsert user {user_id}: {exc}")
        return None


def touch_user(user_id: str) -> None:
    """Update last_seen_at for an already-registered user."""

    try:
        (
            supabase
            .table(TABLE_NAME)
            .update({"last_seen_at": "now()"})
            .eq("user_id", user_id)
            .execute()
        )
    except Exception:
        pass


def get_user(user_id: str) -> dict | None:
    try:
        response = (
            supabase
            .table(TABLE_NAME)
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception:
        return None
