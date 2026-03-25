# ZeleraDeck — Progress Log
> What was done, errors encountered, tests run, results. Updated daily.

---

## 🟢 Status: Phase 1 Complete — All connections verified (2026-03-25)

---

## Log

### [Day 0] — Project Initialisation
- ✅ claude.md (Project Constitution) created
- ✅ task_plan.md created with 5-week timeline
- ✅ findings.md created with library decisions
- ✅ architecture/ directory created
- ✅ tools/ directory created
- ✅ .tmp/ directory created
- ⏳ Figma wireframes — pending
- ✅ .env.example — created

**Next action:** Team to review claude.md. All 3 members must agree before Phase 1 begins.

---

### [Day 1] — Phase 1: Link (Connectivity Verification)

**Django Setup**
- ✅ Virtual environment created: `backend/.venv/`
- ✅ All packages installed (Django 6.0.3, DRF, SimpleJWT, Cloudinary, CORS, psycopg2, etc.)
- ✅ `requirements.txt` frozen
- ✅ Django project `config` created inside `backend/`
- ✅ `settings.py` configured: dotenv, PostgreSQL, CORS, Cloudinary, JWT (60min/7day)
- ✅ `config/urls.py` — health check endpoint `/api/health/` added
- ✅ `tools/test_db.py` and `tools/test_cloudinary.py` copied to `backend/tools/`
- ✅ `backend/.env` created and filled with real credentials

**DB Test (tools/test_db.py)**
- ✅ PASS — Connected to PostgreSQL 18.1 on localhost:5432
- Database: `zeleradeck_db`
- All 18 Django migrations applied successfully

**Cloudinary Test (tools/test_cloudinary.py)**
- ✅ PASS — Test image uploaded and cleaned up
- URL: `https://res.cloudinary.com/de7f6rnco/image/upload/v.../zeleradeck_test_connection.png`
- Cloud: `de7f6rnco`

**React Setup**
- ✅ Vite React project created: `frontend/`
- ✅ All npm packages installed: tailwindcss, @tailwindcss/vite, axios, @tanstack/react-query, react-router-dom, qrcode.react, browser-image-compression
- ✅ Tailwind CSS v4 configured via `@tailwindcss/vite` plugin
- ✅ Axios pre-configured with base URL `http://localhost:8000/api/`
- ✅ Health check component in `App.jsx`

**Health Check Endpoint**
- ✅ `GET /api/health/` → `{"status": "ok"}` — verified in browser
- ✅ React app at `http://localhost:5173` displays: **"Backend connected ✅"**

---

## Error Registry
> Record every error here with resolution so it never repeats.

| # | Error | Root Cause | Fix | Date |
|---|---|---|---|---|
| 1 | `UnicodeEncodeError` in test scripts | Windows terminal (cp1252) can't render emoji characters | Added `sys.stdout.reconfigure(encoding='utf-8')` and replaced emoji with ASCII `[PASS]`/`[FAIL]` | 2026-03-25 |
| 2 | `npm` blocked by execution policy | PowerShell default policy blocks `.ps1` scripts | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` | 2026-03-25 |

---

## Test Results
> Record every test script result.

| Script | Status | Output | Date |
|---|---|---|---|
| tools/test_cloudinary.py | ✅ PASS | Upload to `de7f6rnco`, test image cleaned up | 2026-03-25 |
| tools/test_auth.py | ⏳ Not run | — | — |
| tools/test_db.py | ✅ PASS | PostgreSQL 18.1 on localhost:5432 | 2026-03-25 |
| React health check | ✅ PASS | "Backend connected ✅" at http://localhost:5173 | 2026-03-25 |

---

**Phase 1 Complete — All connections verified. 2026-03-25.**
