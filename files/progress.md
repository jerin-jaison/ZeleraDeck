# ZeleraDeck — Progress Update (March 27, 2026)

## ✅ FIX 1 — Admin Panel: Edit Phone, Shop Name, Expiry

**Backend** (`accounts/views.py`):
- `AdminShopEditView` updated with phone stripping (spaces/dashes removed), uniqueness validation with clear error message, ISO8601/YYYY-MM-DD date parsing, null expiry support, and `token_version` increment on phone change to force re-login.

**Frontend** (`AdminShopDetail.jsx`):
- Full inline edit form added: Shop Name, Phone (10-digit validation + logout warning), Subscription Expiry (with Clear button, expired/expiring-soon/active status badges), Admin Notes, and Reset Password section. Inline error display for duplicate phone.

---

## ✅ FIX 2 — Product Delete Button Hidden by Bottom Nav

- `Dashboard.jsx`: Bottom padding increased from `pb-24` to `pb-32` (128px clearance)
- `DashboardProductListItem.jsx`: Delete bottom sheet z-index raised to `z-[200]`, backdrop to `z-[199]`, bottom padding `pb-24` added
- `EditProduct.jsx`: Delete link section padding increased to `pb-28`, delete sheet z-index fixed to `z-[200]`

---

## ✅ FIX 3 — Replace Logo Everywhere

- `logo2.png` copied to `frontend/public/`
- Created shared `Logo.jsx` component with `size`, `variant` (icon/full/full-stacked), `theme` (dark/light) props
- Replaced logos in: `Login.jsx`, `AdminLayout.jsx` (sidebar + password gate), `Dashboard.jsx` (header)
- Updated `index.html`: favicon and apple-touch-icon → `logo2.png`, title → "ZeleraDeck — Your shop. One link."

---

## ✅ FIX 4 — WhatsApp Link Previews (OG Meta Tags)

**Backend** (`catalogue/views.py`):
- `og_store_view` — serves HTML with OG tags (title, description, image) + meta-refresh redirect to React store
- `og_product_view` — serves HTML with OG tags (product name, price, image) + meta-refresh redirect to React product page
- Both views are plain Django `HttpResponse` (no DRF auth, fully public)

**URL Wiring** (`config/urls.py`):
- `/og/store/<slug>/` → `og_store_view`
- `/og/store/<slug>/product/<display_id>/` → `og_product_view`

**Frontend WhatsApp links updated**:
- `ProductPage.jsx`, `StorePage.jsx`, `StoreInfo.jsx` — link in WhatsApp messages now uses `zeleradeck.onrender.com/og/store/...` for rich link previews

---

## Build Status
- `npm run build` ✅ — 0 errors, built in 696ms
