# HealthLens AI - Production Deployment & Cloud Infrastructure Guide

This guide outlines deployment procedures for Docker containerization and managed cloud platforms (Render, Vercel, Supabase, Clerk).

---

## 1. Quickest Deployment: Docker Compose (Local or VPS)

Run the complete multi-tier stack on any Linux, macOS, or Windows host equipped with Docker:

```bash
# 1. Clone repository
git clone https://github.com/shayan123-svg/Health-Lens-AI.git
cd Health-Lens-AI

# 2. Launch both Backend and Frontend containers
docker compose up --build -d
```

### Checking Services
```bash
# View running containers
docker compose ps

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Stop containers
docker compose down
```

---

## 2. Cloud Production Deployment

### A. Database Layer: Supabase (PostgreSQL)
1. Navigate to [Supabase](https://supabase.com/) and create a new project.
2. Open the **SQL Editor** in the Supabase Dashboard and run:
   ```sql
   create table if not exists public.users (
     user_id text primary key,
     email text,
     full_name text,
     created_at timestamptz not null default now(),
     last_seen_at timestamptz not null default now()
   );

   create table if not exists public.reports (
     report_id uuid primary key default gen_random_uuid(),
     user_id text not null,
     filename text,
     file_type text,
     status text default 'completed',
     extracted_features jsonb default '{}'::jsonb,
     prediction jsonb default '{}'::jsonb,
     ai_recommendations text,
     created_at timestamptz not null default now()
   );
   ```
3. Retrieve your **Project URL**, **Anon Key**, and **Service Role Key** under `Project Settings -> API`.

---

### B. Authentication Layer: Clerk
1. In the [Clerk Dashboard](https://dashboard.clerk.com/), create an application.
2. Under **API Keys**, copy the **Publishable Key** (used in Frontend) and **Secret Key**.
3. Under **JWT Templates**, note the **Issuer URL** (e.g. `https://your-app.clerk.accounts.dev`).

---

### C. Backend API Deployment: Render
The backend includes a preconfigured [`Backend/render.yaml`](../Backend/render.yaml) specification.

1. Connect your GitHub repository to Render.
2. Create a new **Web Service** pointing to the `Backend` directory.
3. Configure the settings:
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables in Render:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `CLERK_ISSUER`: Clerk issuer URL
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g. `https://healthlens.vercel.app`)

---

### D. Frontend Deployment: Vercel
1. In the [Vercel Dashboard](https://vercel.com/), click **Add New Project** and import the repository.
2. Set the **Root Directory** to `frontend`.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render API URL (e.g. `https://healthlens-api.onrender.com`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key (`pk_live_...` or `pk_test_...`)
4. Click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 3. Complete Environment Variables Matrix

### Backend (`Backend/.env`)
| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Optional | Port for uvicorn server (Default: `8000`) |
| `ALLOWED_ORIGINS` | Optional | Comma-separated list of allowed frontend domains |
| `SUPABASE_URL` | Recommended | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY`| Recommended | Supabase administrative service role secret key |
| `SUPABASE_KEY` | Optional | Fallback publishable key |
| `CLERK_ISSUER` | Optional | Clerk authentication token issuer URL |
| `OPENROUTER_API_KEY` | Recommended | OpenRouter API Key for Vision LLM & clinical assistant |
| `OPENROUTER_BASE_URL` | Optional | API URL (Default: `https://openrouter.ai/api/v1/chat/completions`) |
| `LLM_MODEL` | Optional | Default model identifier (Default: `openrouter/free`) |

### Frontend (`frontend/.env.local`)
| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Base URL of FastAPI Backend (`http://localhost:8000` or Render URL) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional | Clerk client authentication key (`pk_...`) |
