# InvoiceApp Monorepo

This repository contains the InvoiceApp MVP:

- `backend/`: FastAPI + PostgreSQL API
- `frontend/`: React + Vite + Tailwind web client
- `docs/`: requirements and supporting docs

## Local Development

### Backend
1. Create virtual environment and install dependencies from `backend/requirements.txt`.
2. Copy `backend/.env.example` to `backend/.env` and configure values.
3. Run:
   - `uvicorn app.main:app --reload --app-dir backend`

### Frontend
1. In `frontend/`, install dependencies:
   - `npm install`
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run:
   - `npm run dev`

## Deployment Targets
- Frontend: Vercel
- Backend: Render
- Database: Managed Postgres
- Email: Resend
- PDF storage (MVP): local disk at backend `STORAGE_PATH`
