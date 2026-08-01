# ZeleraDeck — Task Plan
> Phases, goals, and checklists. Update status as you go.

---

## 🗓️ Master Timeline: 5 Weeks to First Real Shop

```
Week 1–2  →  Blueprint + Backend Foundation
Week 3–4  →  Frontend + Public Store Page
Week 5    →  Polish + Deploy + Onboard first 3 shops
```

---

## ✅ Phase 0: B — Blueprint (Pre-Code)
**Goal:** Decisions made. Schema locked. No ambiguity before first line of code.

- [x] North Star defined
- [x] Tech stack chosen
- [x] Data schema written in claude.md
- [x] URL structure defined
- [x] WhatsApp message template finalised
- [x] MVP hard limits documented
- [x] Design system defined (white, Inter, Tailwind)
- [x] All error states designed (broken image, 404, disabled shop)
- [ ] Figma/wireframe for 3 screens: Store page, Dashboard, Admin panel
- [ ] `.env.example` file created with all required keys listed

**Exit Criteria:** claude.md is complete. All three team members have read it and agreed.

---

## ✅ Phase 1: L — Link (Connectivity Verification)
**Goal:** All external services confirmed working before building logic.

- [ ] Cloudinary account created, API keys in `.env`
- [ ] Test image upload to Cloudinary via Python script (`tools/test_cloudinary.py`)
- [ ] PostgreSQL database created locally and on VPS
- [ ] Django project initialised, DB connection confirmed
- [ ] JWT auth library installed and responding (`tools/test_auth.py`)
- [ ] React project created, Axios configured, can hit Django dev server

**Exit Criteria:** All tools/ test scripts return success. Zero broken integrations.

---

## ✅ Phase 2: A — Architect (3-Layer Build)
### 2A: Backend (Django)

**Models**
- [ ] `Shop` model (uuid, name, slug, phone, whatsapp_number, password, is_active, timestamps)
- [ ] `Product` model (uuid, display_id auto-gen, shop FK, name, price, description, image_url, is_in_stock, timestamps)
- [ ] Slug auto-generation on shop creation (immutable after save)
- [ ] Display ID auto-generation (`PRD` + 4-digit sequence per shop)

**Auth APIs**
- [ ] `POST /api/auth/login/` — phone + password → JWT tokens
- [ ] `POST /api/auth/refresh/` — refresh token → new access token
- [ ] JWT middleware protecting shop-owner routes

**Admin APIs**
- [ ] `POST /api/admin/shops/` — create shop
- [ ] `GET /api/admin/shops/` — list all shops
- [ ] `PATCH /api/admin/shops/{id}/toggle/` — enable/disable shop
- [ ] `POST /api/admin/shops/{id}/reset-password/` — admin resets shop owner password

**Shop Owner APIs**
- [ ] `GET /api/shop/products/` — list own products
- [ ] `POST /api/shop/products/` — add product (with Cloudinary image URL)
- [ ] `PATCH /api/shop/products/{id}/` — edit product
- [ ] `DELETE /api/shop/products/{id}/` — delete product
- [ ] `GET /api/shop/me/` — get own shop details + public link

**Public APIs (No Auth)**
- [ ] `GET /api/store/{slug}/` — get shop details + all products (returns 404 if not found, 200 with `is_active: false` if disabled)
- [ ] `GET /api/store/{slug}/product/{display_id}/` — get single product

**Architecture SOP files to write:**
- [ ] `architecture/auth-flow.md`
- [ ] `architecture/product-management.md`
- [ ] `architecture/public-store.md`
- [ ] `architecture/image-upload.md`
- [ ] `architecture/admin-controls.md`

### 2B: Frontend (React)

**Pages**
- [ ] `/login` — Phone + password form
- [ ] `/dashboard` — Product grid with add/edit/delete. Empty state if no products.
- [ ] `/dashboard/add-product` — Upload form with image preview
- [ ] `/dashboard/store-info` — Shows public link + QR code download + WhatsApp share button
- [ ] `/store/{slug}` — Public catalogue (skeleton loader → product grid)
- [ ] `/store/{slug}/product/{display_id}` — Single product page
- [ ] `404 page` — Friendly not-found for unknown store slugs
- [ ] `Disabled store page` — "Unavailable" with shop WhatsApp shown

**Components**
- [ ] `ProductCard` — Image, name, price, stock badge, WhatsApp button
- [ ] `ProductForm` — Add/edit with image compress + preview
- [ ] `SkeletonCard` — Loading placeholder
- [ ] `QRCodePanel` — Shows QR + copy link + share on WhatsApp
- [ ] `ImageWithFallback` — Renders placeholder SVG on broken image
- [ ] `StoreDisabledBanner` — Shows on inactive shop public page
- [ ] `AdminShopCard` — Admin panel shop row with toggle switch

---

## ✅ Phase 3: S — Stylize (Polish)
**Goal:** The product looks premium. Real shop owners trust it.

- [ ] Mobile test on real Android phones (Chrome — most common in Kerala)
- [ ] Verify all Tailwind classes render correctly on mobile
- [ ] Test slow-network image loading (skeleton shows correctly)
- [ ] QR code renders and downloads as PNG correctly
- [ ] WhatsApp button opens correctly on mobile (wa.me link)
- [ ] All error states verified: broken image, 404, disabled shop
- [ ] Empty state on dashboard looks encouraging, not broken
- [ ] Test with actual shop data (real product photos, real prices)

---

## ✅ Phase 4: T — Trigger (Deployment)
**Goal:** Live on VPS. First 3 shops onboarded.

- [ ] Hostinger VPS provisioned (Ubuntu)
- [ ] Nginx config written (`architecture/nginx.md`)
- [ ] Gunicorn config + systemd service file
- [ ] PostgreSQL on VPS configured
- [ ] `.env` production values set
- [ ] SSL via Let's Encrypt (Certbot)
- [ ] Domain pointed to VPS IP
- [ ] Django `collectstatic` run, static files served by Nginx
- [ ] React build deployed under Nginx
- [ ] Smoke test: create shop → add product → open `/store/slug` on mobile → click WhatsApp button
- [ ] Onboard 3 real shops (free trial)
- [ ] Collect feedback after 1 week

---

## 📊 Success Criteria for MVP
| Metric | Target |
|---|---|
| Weeks to deploy | 5 |
| First shops onboarded | 3 (free trial) |
| WhatsApp button working on mobile | 100% |
| Page load on slow 4G | < 3 seconds |
| Shop owner setup time | < 10 minutes |
| Admin can create + disable shop | Working |
