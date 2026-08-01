# SOP: Public Store Page
> Layer 1 Architecture Document. Update this before updating code.

---

## Goal
Give every shop a public, customer-facing catalogue at `/store/{slug}` that works fast on mobile, requires no login, and drives WhatsApp enquiries.

---

## Data Flow
```
Customer opens /store/sri-ram-textiles
        ↓
React: GET /api/store/sri-ram-textiles/
        ↓
Django: Look up Shop where slug = "sri-ram-textiles"
        ↓
Not found?   → Return 404 JSON
Found + is_active=False? → Return 200 with { is_active: false, whatsapp: "..." }
Found + is_active=True?  → Return shop + all products
        ↓
React renders accordingly (see UI States below)
```

---

## API Response Shape

### Shop not found (404)
```json
{ "error": "Store not found" }
```

### Shop disabled (200)
```json
{
  "is_active": false,
  "name": "Sri Ram Textiles",
  "whatsapp_number": "919876543210"
}
```

### Shop active (200)
```json
{
  "is_active": true,
  "name": "Sri Ram Textiles",
  "slug": "sri-ram-textiles",
  "whatsapp_number": "919876543210",
  "products": [
    {
      "display_id": "PRD0001",
      "name": "Blue Cotton Saree",
      "price": "850.00",
      "description": "Pure cotton, hand-woven",
      "image_url": "https://res.cloudinary.com/...",
      "is_in_stock": true
    }
  ]
}
```

---

## UI States (React)

| State | What to Show |
|---|---|
| Loading | Skeleton card grid (3×2 on mobile) |
| Store not found | Friendly 404 illustration + "This store doesn't exist" |
| Store disabled | Clean banner: "Store temporarily unavailable." + "Chat with shop on WhatsApp" button (opens wa.me link) |
| Store active, no products | Empty state: "No products listed yet." |
| Store active, products loaded | Clean product grid |

---

## WhatsApp Button Logic
```javascript
const message = `Hi! I'm interested in ordering:\n\n` +
  `🛍️ Product: ${product.name}\n` +
  `🆔 ID: ${product.display_id}\n` +
  `💰 Price: ₹${product.price}\n` +
  `🔗 Link: zeleradeck.com/store/${slug}/product/${product.display_id}\n\n` +
  `Please confirm availability. Thank you!`;

const url = `https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(message)}`;
window.open(url, '_blank');
```

## Rules
1. Out-of-stock products: show in grid with "Out of Stock" badge. **Hide** the WhatsApp button.
2. Broken image: show grey placeholder SVG — never show broken image icon.
3. Do not cache the product list aggressively — use TanStack Query with 2-minute stale time.
4. No infinite scroll in MVP — show all products (max 100 per shop anyway).
5. Page title = shop name. Meta description = "Browse {shop name}'s product catalogue."

---

## Performance Rules
- Images: always append `?w=400&q=auto&f=auto` to Cloudinary URL for mobile
- Skeleton loader must appear within 100ms of navigation
- No full-page spinner — skeleton cards only
