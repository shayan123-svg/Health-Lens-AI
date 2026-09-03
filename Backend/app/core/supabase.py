import os

from dotenv import load_dotenv
from supabase import create_client, Client


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")

# Authentication is handled by Clerk, so Supabase Auth / RLS tied to
# Supabase users no longer applies. The trusted backend therefore uses the
# service-role key to read/write tables. Fall back to SUPABASE_KEY for local
# development where a service-role key may not be configured.
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured.")

if not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) is not configured."
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)
