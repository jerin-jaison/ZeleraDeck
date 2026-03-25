# SOP: Authentication Flow
> Layer 1 Architecture Document. Update this before updating code.

---

## Goal
Allow shop owners to securely log in using phone number + password and receive JWT tokens for API access. Admin uses Django's built-in superuser system.

---

## Actors
- **Admin:** Django superuser. Accesses custom admin API and Django /admin/.
- **Shop Owner:** Logs in via `/api/auth/login/`. Gets JWT access + refresh token.
- **Customer:** No authentication. Accesses public routes only.

---

## Login Flow

```
Shop Owner enters phone + password
        ↓
POST /api/auth/login/
        ↓
Django: Find Shop where phone = input
        ↓
Check password hash (bcrypt via Django's make_password)
        ↓
If valid → Return { access_token, refresh_token, shop_id, shop_name, slug }
If invalid → Return 401 { error: "Invalid phone or password" }
```

## Token Refresh Flow
```
Access token expires (60 min)
        ↓
React: Axios interceptor catches 401
        ↓
POST /api/auth/refresh/ with refresh token
        ↓
If valid → Return new access token
If invalid → Redirect to /login
```

---

## Implementation Rules
1. Phone number stored as plain string (no formatting). Always strip spaces/dashes before saving.
2. Password stored using Django's `make_password()`. Never store plain text.
3. JWT access token lifetime: 60 minutes
4. JWT refresh token lifetime: 7 days
5. Store tokens in React: `localStorage` (acceptable for MVP — revisit for security hardening later)
6. All shop-owner API routes protected by `IsAuthenticated` permission class
7. Shop must also have `is_active=True` — if shop is disabled, return 403 on all protected routes

---

## Password Reset (MVP)
- No self-service. Admin only.
- Admin calls: `POST /api/admin/shops/{id}/reset-password/` with `{ new_password: "..." }`
- Django hashes and saves. Shop owner receives new password via WhatsApp/call from team.

---

## Edge Cases
| Case | Behaviour |
|---|---|
| Wrong phone | 401 — "Invalid phone or password" (do not reveal if phone exists) |
| Wrong password | 401 — Same generic message |
| Disabled shop tries to login | 403 — "Your store has been deactivated. Contact support." |
| Expired access token | Axios interceptor auto-refreshes silently |
| Expired refresh token | Redirect to /login with message "Session expired. Please log in again." |
