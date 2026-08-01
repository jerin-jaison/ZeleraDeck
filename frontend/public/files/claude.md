# ZeleraDeck — Project Constitution
> This file is LAW. Update only when schema, rules, or architecture changes.

---

## 🧠 Project Identity
- **Product name:** ZeleraDeck
- **Tagline:** Your shop. One link. Every customer.
- **Stage:** MVP — Small-scale, manual onboarding
- **Team:** 3 students (Django backend, React frontend, Sales/Support)

---

## 🎯 North Star
Give every small shop owner in Kerala a premium, shareable digital catalogue that works on WhatsApp — built in 5 weeks, sold manually, scaled later.

---

## 🏗️ Tech Stack
| Layer | Technology |
|---|---|
| Backend | Django 5.x + Django REST Framework |
| Frontend | React 18 + Tailwind CSS (no UI lib) |
| Database | PostgreSQL |
| Image Storage | Cloudinary |
| Hosting | Hostinger VPS (Nginx + Gunicorn) |
| Auth | JWT (SimpleJWT) — phone + password |
| HTTP Client | Axios |
| State/Data | TanStack Query (React Query) |
| QR Code | qrcode.react |
| Image Compress | browser-image-compression (frontend) |

---

## 📐 Data Schema (Source of Truth)

### Shop
```json
{
  "id": "uuid",
  "name": "Sri Ram Textiles",
  "slug": "sri-ram-textiles",
  "phone": "9876543210",
  "password": "hashed",
  "whatsapp_number": "9876543210",
  "is_active": true,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Product
```json
{
  "id": "uuid",
  "display_id": "PRD1023",
  "shop": "shop_uuid",
  "name": "Blue Cotton Saree",
  "price": 850.00,
  "description": "optional string or null",
  "image_url": "https://res.cloudinary.com/...",
  "is_in_stock": true,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Admin User
```json
{
  "id": "uuid",
  "username": "admin",
  "is_superuser": true
}
```

---

## 🔐 Authentication Rules
- **Admin:** Django superuser — accesses /admin/ panel + custom admin API
- **Shop Owner:** Logs in with `phone` + `password` → receives JWT access + refresh token
- **Customer:** No login. Public route only. No session.
- **Password Reset:** Manual only. Shop owner contacts admin. Admin resets from dashboard.
- **OTP:** NOT implemented in MVP. Future phase only.

---

## 🌐 URL Schema
| Route | Access | Description |
|---|---|---|
| `/store/{slug}` | Public | Customer-facing catalogue |
| `/store/{slug}/product/{display_id}` | Public | Individual product deep link |
| `/dashboard` | Shop Owner | Product management |
| `/admin-panel` | Admin | Shop management |
| `/login` | Public | Shop owner login page |

### Slug Rules
- Auto-generated from shop name at creation (lowercase, hyphenated)
- Enforced unique at DB level
- **Immutable after creation** — display name can change, slug cannot
- Example: "Sri Ram Textiles (New Branch)" → slug: `sri-ram-textiles`

---

## 💬 WhatsApp Message Template
```
Hi! I'm interested in ordering:

🛍️ Product: {product_name}
🆔 ID: {display_id}
💰 Price: ₹{price}
🔗 Link: zeleradeck.com/store/{slug}/product/{display_id}

Please confirm availability. Thank you!
```

---

## 🎨 Design System
- **Primary color:** Clean white (#FFFFFF) with accent colors for CTAs
- **Font:** Inter (Google Fonts — free, premium feel)
- **UI Library:** None — raw Tailwind CSS + custom components
- **Mobile-first:** All designs start at 375px width
- **Theme:** Light mode only in MVP

### Key UI States (All must be designed)
| State | Behaviour |
|---|---|
| Empty shop (no products) | Illustration + "Add your first product" CTA |
| Broken/missing image | Grey placeholder with product icon |
| Store not found (`/store/xyz`) | Friendly 404 — "This store doesn't exist" |
| Store disabled by admin | "Store temporarily unavailable. Contact shop directly." + WhatsApp number shown |
| Loading | Skeleton cards — no spinner |
| Out of stock product | Product shown with "Out of Stock" badge, WhatsApp button hidden |

---

## 🚫 MVP Hard Limits (Do Not Build)
- No payment gateway
- No cart system
- No product categories → ✅ IMPLEMENTED (optional, shop-owner managed)
- No public signup
- No OTP login
- No complex analytics
- No dark mode
- No multi-language support

---

## 💰 Business Rules
- **Payment:** Manual UPI collection by team
- **Subscription control:** Admin activates/deactivates shop from dashboard
- **Onboarding:** Admin creates shop account manually after payment confirmed
- **Trial:** First month free for early shops (reference customers)

---

## 📦 Image Rules
- Compress on frontend before upload (browser-image-compression)
- Max file size before compression: 5MB
- Max products per shop (MVP): 100
- Storage: Cloudinary free tier
- Fallback: Grey placeholder SVG if image fails to load
