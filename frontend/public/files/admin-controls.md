# SOP: Admin Controls
> Layer 1 Architecture Document. Update this before updating code.

---

## Goal
Allow the platform admin (the team) to create shop accounts, activate/deactivate subscriptions, and reset passwords — all from a simple dashboard.

---

## Admin Authentication
- Admin uses Django's built-in superuser system
- Admin logs in via a separate login page or the custom admin panel login
- All admin API routes protected by `IsAdminUser` permission class
- Regular shop owners cannot access any `/api/admin/` route (403)

---

## Admin Capabilities (MVP)

### 1. Create Shop Account
```
Admin fills form: Shop name, Phone, WhatsApp number, Password
        ↓
POST /api/admin/shops/
        ↓
Django: Auto-generate slug from shop name (enforce unique)
Django: Hash password
Django: Create Shop (is_active=True by default)
Django: Initialise product_counter = 0
        ↓
Return: { shop_id, slug, public_url }
        ↓
Admin shares login credentials + public URL with shop owner via WhatsApp
```

### 2. Toggle Shop Subscription
```
Admin clicks Enable/Disable toggle on shop card
        ↓
PATCH /api/admin/shops/{id}/toggle/
        ↓
Django: Flip is_active boolean
        ↓
If disabled: Public store page immediately shows "unavailable" message
If enabled:  Public store page immediately shows live products
```

### 3. Reset Shop Owner Password
```
Shop owner contacts team (WhatsApp/call)
Admin verifies identity verbally
        ↓
POST /api/admin/shops/{id}/reset-password/
Body: { "new_password": "..." }
        ↓
Django: Hash new password, save
        ↓
Admin shares new password with shop owner via WhatsApp
```

### 4. View Shop List
```
GET /api/admin/shops/
        ↓
Returns: list of all shops with name, slug, phone, is_active, product_count, created_at
```

---

## Slug Generation Algorithm
```python
import re
from django.utils.text import slugify

def generate_unique_slug(name):
    base_slug = slugify(name)  # handles Malayalam transliteration too
    slug = base_slug
    counter = 1
    while Shop.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug
```
- Call only on Shop creation (`save()` override with `if not self.pk`)
- Never regenerate on subsequent saves

---

## Admin Panel UI (React)
- Route: `/admin-panel` — protected, admin JWT only
- Shows: Table/card list of all shops
- Each shop card shows: Name, Slug, Phone, Status badge (Active/Inactive), Product count, Created date
- Actions per shop: Toggle active/inactive switch, Reset password button, View public store link

---

## Edge Cases
| Case | Behaviour |
|---|---|
| Slug collision (2 shops with same name) | Auto-append `-2`, `-3` etc. |
| Admin creates shop with duplicate phone | Return 400 — "A shop with this phone number already exists" |
| Admin disables shop that's currently being browsed | Customer sees disabled page on next page load/refresh |
| Admin resets password with empty string | Return 400 — "Password cannot be empty" |
