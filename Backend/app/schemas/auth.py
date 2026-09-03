from pydantic import BaseModel, EmailStr


class UserSyncRequest(BaseModel):
    """
    Profile details pushed by the frontend after Clerk sign-in.
    The user identity itself always comes from the verified token.
    """

    email: EmailStr | None = None
    full_name: str | None = None
