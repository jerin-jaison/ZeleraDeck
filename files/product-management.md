# SOP: Product Management
> Layer 1 Architecture Document. Update this before updating code.

---

## Goal
Allow shop owners to add, edit, delete, and toggle stock on their products through a simple, mobile-friendly dashboard.

---

## Product Lifecycle
```
Shop Owner logs in
        ↓
Opens Dashboard → Sees their product grid
        ↓
Clicks "Add Product"
        ↓
Fills form: Name, Price, Image (required) | Description (optional)
        ↓
Frontend: Compress image (browser-image-compression)
        ↓
POST /api/shop/products/ → multipart form with image file
        ↓
Django: Upload image to Cloudinary → get URL
        ↓
Django: Generate display_id (PRD0001, PRD0002...)
        ↓
Django: Save Product → Return product JSON
        ↓
React: Add to product list (TanStack Query invalidate)
```

---

## Display ID Generation Rule
```python
def generate_display_id(shop):
    # Count all products ever created for shop (including deleted)
    # Use a separate counter field on Shop model to avoid reuse
    shop.product_counter += 1
    shop.save(update_fields=['product_counter'])
    return f"PRD{shop.product_counter:04d}"
```
**Why a counter field?** If we use `products.count()`, deleting a product would cause ID reuse (PRD0005 deleted → next product gets PRD0005 again → confusing for shop owner). A counter always increments, never reuses.

---

## Image Upload Flow
```
User selects image (max 5MB)
        ↓
browser-image-compression reduces to ≤500KB
        ↓
Show preview in form
        ↓
On submit: FormData with compressed file sent to Django
        ↓
Django: cloudinary.uploader.upload(file) → returns secure_url
        ↓
Save secure_url to product.image_url
```

---

## API Endpoints

### List products (own shop)
`GET /api/shop/products/`
- Auth: Required (shop owner JWT)
- Returns: All products for authenticated shop owner's shop
- Order: newest first

### Add product
`POST /api/shop/products/`
- Auth: Required
- Body: multipart/form-data — `name`, `price`, `image` (file), `description` (optional)
- Returns: Created product JSON

### Edit product
`PATCH /api/shop/products/{id}/`
- Auth: Required. Shop owner can only edit own products.
- Body: Any subset of `name`, `price`, `description`, `is_in_stock`
- Image update: Send new `image` file to replace
- Returns: Updated product JSON

### Delete product
`DELETE /api/shop/products/{id}/`
- Auth: Required. Own products only.
- Returns: 204 No Content

### Toggle stock
`PATCH /api/shop/products/{id}/`
- Body: `{ "is_in_stock": false }`
- This is just a partial update — no special endpoint needed

---

## Validation Rules
| Field | Rule |
|---|---|
| name | Required. Max 100 chars. |
| price | Required. Positive decimal. Max 9,999,999.99 |
| image | Required on create. Max 5MB before compression. jpg/png/webp only. |
| description | Optional. Max 500 chars. |
| is_in_stock | Default: True. Boolean. |

---

## Edge Cases
| Case | Behaviour |
|---|---|
| Cloudinary upload fails | Return 500 — "Image upload failed. Try again." |
| Image format not supported | Return 400 — "Only JPG, PNG, WebP images allowed" |
| Price entered as text | Return 400 — form validation catches this |
| Shop owner tries to edit another shop's product | Return 403 — enforced by `get_queryset` filtering by `request.user.shop` |
| Dashboard with 0 products | Show empty state: illustration + "Add your first product" button |
