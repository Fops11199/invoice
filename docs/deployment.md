# Deployment Notes

## Frontend (Vercel)
- Import repository into Vercel.
- Set project root to `frontend/`.
- Set env var:
  - `VITE_API_BASE_URL=https://<render-backend-domain>/api/v1`

## Backend (Render)
- Use `render.yaml` blueprint or create web service manually.
- Root directory: `backend/`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars from `backend/.env.example`.
- Ensure `ALLOWED_ORIGINS` includes Vercel domain.

## Smoke Tests
- Frontend build: `npm run build` in `frontend/` should pass.
- Backend check:
  - `GET /health`
  - register/login
  - create client
  - create invoice
  - download PDF
  - send invoice email
