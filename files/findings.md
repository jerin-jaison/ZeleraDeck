# ZeleraDeck — Findings & Research
> Discoveries, constraints, and learnings. Updated as we build.

---

## 📦 Library Decisions & Rationale

### Frontend
| Library | Version | Why |
|---|---|---|
| React | 18.x | Team knows it |
| Tailwind CSS | 3.x | No heavy UI lib, stays premium |
| TanStack Query | 5.x | Best-in-class for API data on mobile |
| Axios | 1.x | Familiar, interceptors for JWT |
| qrcode.react | 3.x | Zero-config QR generation |
| browser-image-compression | 2.x | Client-side compress before upload |
| react-router-dom | 6.x | Standard routing |

### Backend
| Library | Version | Why |
|---|---|---|
| Django | 5.x | Team's primary stack |
| djangorestframework | 3.15.x | Standard REST API |
| djangorestframework-simplejwt | 5.x | JWT auth, battle-tested |
| django-cloudinary-storage | 0.3.x | Cloudinary integration |
| django-cors-headers | 4.x | Allow React dev server |
| psycopg2-binary | 2.9.x | PostgreSQL driver |
| python-dotenv | 1.x | .env file loading |
| pillow | 10.x | Image processing |
| django-filter | 23.x | Future-proofing for product filters |

---

## 🔗 External Service Notes

### Cloudinary
- Free tier: 25 credits/month (sufficient for MVP with <10 shops)
- Upload preset: Use unsigned preset for frontend direct upload OR signed via backend
- **Decision:** Upload via Django backend (avoids exposing API secret in React)
- Image transformation URL: `?w=400&q=auto&f=auto` — add to all `image_url` rendering
- Fallback: if `image_url` is null or 404 → show grey placeholder SVG

### WhatsApp Deep Link Format
```
https://wa.me/{phone_number}?text={url_encoded_message}
```
- Phone number must include country code, no `+` symbol: `919876543210`
- Test on real Android before launch — desktop browsers open WhatsApp Web

### Hostinger VPS
- Recommended: KVM2 plan (2 vCPU, 8GB RAM) for MVP
- Ubuntu 22.04 LTS
- Nginx → Gunicorn → Django
- Let's Encrypt SSL is free and auto-renews via Certbot

---

## ⚠️ Known Constraints

### Slug Immutability
- Once a shop is created, its slug cannot change
- Display name can change freely
- This protects all shared QR codes and WhatsApp links from breaking
- Implement: override `save()` on Shop model to only set slug if `self.pk is None`

### Display ID Generation
- Format: `PRD` + zero-padded 4-digit number per shop
- Scoped per shop (each shop starts from PRD0001)
- Implemented as: `shop.products.count() + 1` at creation time, formatted as `PRD{n:04d}`
- Edge case: if a product is deleted, the count still increments (no reuse of IDs — prevents confusion)

### Password Reset (MVP)
- No self-service reset
- Shop owner calls/WhatsApps the team
- Admin uses `/api/admin/shops/{id}/reset-password/` to set a new password
- Communicate clearly to shop owners at onboarding

### Mobile Browser Compatibility
- Primary target: Chrome on Android (most common in Kerala tier-2 towns)
- Secondary: Safari on iPhone
- Avoid CSS features not supported on Chrome Android < 100

---

## 💡 Future Phase Ideas (Not MVP)
- Product categories / tags
- Search within store
- Analytics: views per product, WhatsApp click rate
- Self-service signup + Razorpay subscription
- OTP login via MSG91 or Twilio
- Multiple images per product
- Store customisation (banner, logo, color theme)
- Bulk product CSV upload
