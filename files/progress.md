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

## ✅ FIX 5 — Maintenance Page Centered on Desktop

**Frontend** (`AdminMaintenance.jsx`):
- Outer wrapper: `flex flex-col items-center justify-center min-h-[calc(100vh-0px)]` — centers content both horizontally and vertically in the admin content area
- Inner block: `w-full max-w-lg` — limits card width to 512px
- Page title & subtitle moved inside the centered block with `text-center`
- Loading skeleton state uses the same centered layout

---

## ✅ FIX 6 — Maintenance Preview Text Color → Coral #FF6B6B

**Frontend**:
- `AdminMaintenance.jsx`: Mini preview subtitle text changed from `text-[#737373]` to `style={{ color: '#FF6B6B' }}`
- `MaintenancePage.jsx`: Subtitle/message text changed from `text-[#737373]` to `style={{ color: '#FF6B6B' }}`
- Title "We'll be back soon" remains white — only the description text is coral
- Green elements (orbiting dots, progress bar) unchanged

---

## ✅ FIX 7 — Optional Product Categories

**Backend** (`catalogue/`):
- `Category` model: UUID PK, shop FK, name (max 80), unique_together (shop, name), ordered by name
- `Product.category` FK: nullable, SET_NULL on delete (products become uncategorized, not deleted)
- `CategorySerializer` with product_count, `CategoryCreateSerializer` with validation
- `ProductSerializer` updated with nested `category` + `category_id` write-only field
- `ProductPublicSerializer` updated with `category_name` SerializerMethodField
- `ShopCategoryListCreateView`: list + create with case-insensitive duplicate check
- `ShopCategoryDetailView`: rename (PATCH) + delete (DELETE) with affected product count
- Product create/update views: pre-process `category_id` from FormData (handles empty string / null)
- `PublicStoreView`: includes categories with product counts (only categories with products)
- Shop products API: accepts `?category={uuid}` filter parameter
- URLs wired at `/api/shop/categories/` and `/api/shop/categories/<uuid>/`
- Migrations created and applied

**Frontend**:
- `CategoriesBottomSheet.jsx`: Full CRUD — add (with Enter key + button), inline edit with save/cancel, inline delete confirmation showing affected product count
- `Dashboard.jsx`: "Categories" button in header → opens bottom sheet; category filter pills (shown when 2+ categories); category param in API queries
- `ProductForm.jsx`: Category pill selector (shown when 1+ categories exist); "No category" default + one pill per category; "Manage →" link opens CategoriesBottomSheet
- `StorePage.jsx`: Category filter pills (shown when 2+ categories from public API); client-side filtering by `category_name`; works with search + stock filters

---

## Build Status
- `python manage.py check` ✅ — 0 issues
- `npm run build` ✅ — 0 errors
