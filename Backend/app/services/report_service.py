from uuid import UUID

from app.core.supabase import supabase


TABLE_NAME = "medical_reports"


# All queries that return user data MUST filter by user_id.
# There are intentionally no fallbacks that drop the ownership filter —
# failing closed is the only safe behavior for health data.


def create_report(
    report_id: UUID | str,
    filename: str,
    stored_filename: str,
    file_type: str,
    user_id: str,
):
    payload = {
        "report_id": str(report_id),
        "filename": filename,
        "stored_filename": stored_filename,
        "file_type": file_type,
        "status": "uploaded",
        "user_id": user_id,
    }

    response = supabase.table(TABLE_NAME).insert(payload).execute()
    return response.data[0]


def get_report_for_user(report_id: str, user_id: str):
    """
    Fetch a report only if it belongs to the given user.
    Returns None if missing or not owned by the user.
    """

    response = (
        supabase
        .table(TABLE_NAME)
        .select("*")
        .eq("report_id", str(report_id))
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None


def get_user_reports(user_id: str) -> list:
    """Return reports belonging to the user, newest first."""

    response = (
        supabase
        .table(TABLE_NAME)
        .select(
            "report_id, filename, file_type, status, "
            "prediction, created_at"
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def update_report(report_id: str, user_id: str, data: dict):
    """
    Update a report row scoped to its owner.
    Returns the updated row or None if the report does not belong to the user.
    """

    response = (
        supabase
        .table(TABLE_NAME)
        .update(dict(data))
        .eq("report_id", str(report_id))
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None


def delete_report(report_id: str, user_id: str) -> bool:
    """
    Delete a report only if it belongs to the given user.
    Returns True if a row was deleted, False otherwise.
    """

    response = (
        supabase
        .table(TABLE_NAME)
        .delete()
        .eq("report_id", str(report_id))
        .eq("user_id", user_id)
        .execute()
    )
    return len(response.data or []) > 0
