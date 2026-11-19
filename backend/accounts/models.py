import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password, check_password

# ── Reserved slugs — top-level frontend routes that shops must never collide with.
# Covers every <Route path="..."> in main.jsx that is NOT a /:slug catch-all.
# Also blocks 'store' and 'pro' (the old prefixed paths being retired).
RESERVED_SLUGS = frozenset({
    'login', 'signup', 'about', 'contact', 'why-us',
    'dashboard', 'admin-panel', 'pro-admin',
    'store', 'pro',
    'directory', 'shops', 'sitemap.xml', 'sitemap-stores.xml',
    'maintenance-preview', 'api',
})


class Shop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220)
    phone = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_pro = models.BooleanField(default=False)
    # Only increments. Never decrements. Used for display_id generation.
    product_counter = models.PositiveIntegerField(default=0)

    # ── Shop profile ─────────────────────────────────────────────────────────
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)

    # ── Category, Town & SEO ─────────────────────────────────────────────────
    category = models.CharField(max_length=100, blank=True, default='')
    town = models.CharField(max_length=100, blank=True, default='')
    is_indexable = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=255, blank=True, default='')
    seo_description = models.TextField(blank=True, default='')
    seo_heading = models.CharField(max_length=255, blank=True, default='')
    structured_data = models.JSONField(blank=True, null=True, default=dict)

    # ── Admin / subscription fields ──────────────────────────────────────────
    token_version = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, default='')
    last_login = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── Computed properties ──────────────────────────────────────────────────
    @property
    def whatsapp_number(self):
        """Derive WhatsApp number from phone: strip leading 0, prepend 91."""
        p = self.phone.strip().lstrip('0')
        if not p.startswith('91'):
            p = '91' + p
        return p

    # ── DRF compatibility ────────────────────────────────────────────────────
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone})"

    def generate_seo_fields(self):
        """Auto-generate SEO fields if not provided or empty."""
        cat_clean = self.category.strip() if self.category else ''
        town_clean = self.town.strip() if self.town else ''
        name_clean = self.name.strip()

        # Title: target 30-60 chars
        if not self.seo_title:
            if cat_clean and town_clean:
                candidate = f"{name_clean} — {cat_clean} in {town_clean}"
                if len(candidate) < 30:
                    candidate = f"{name_clean} — {cat_clean} Store in {town_clean}"
                if len(candidate) < 30:
                    candidate = f"{name_clean} — Verified {cat_clean} in {town_clean}"
                self.seo_title = candidate
            elif town_clean:
                candidate = f"{name_clean} — Store in {town_clean}"
                if len(candidate) < 30:
                    candidate = f"{name_clean} — Verified Online Store in {town_clean}"
                self.seo_title = candidate
            elif cat_clean:
                candidate = f"{name_clean} — {cat_clean} Store"
                if len(candidate) < 30:
                    candidate = f"{name_clean} — Verified {cat_clean} Store"
                self.seo_title = candidate
            else:
                self.seo_title = f"{name_clean} — Official Shop Catalogue"

        # Description: target 120-160 chars
        if not self.seo_description:
            if cat_clean and town_clean:
                self.seo_description = (
                    f"Explore {name_clean}, your local {cat_clean.lower()} destination in {town_clean}. "
                    f"Browse catalogue products and order directly on WhatsApp."
                )
            elif town_clean:
                self.seo_description = (
                    f"Browse {name_clean}'s verified product catalogue in {town_clean} on ZeleraDeck. "
                    f"Order directly on WhatsApp with quick delivery."
                )
            elif cat_clean:
                self.seo_description = (
                    f"Browse {name_clean}'s collection of quality {cat_clean.lower()} items on ZeleraDeck. "
                    f"Order directly on WhatsApp with fast local service."
                )
            else:
                self.seo_description = (
                    f"Browse {name_clean}'s product catalogue on ZeleraDeck. "
                    f"Check prices, stock, and order directly on WhatsApp."
                )

        # Heading: H1
        if not self.seo_heading:
            if cat_clean and town_clean:
                self.seo_heading = f"{name_clean} — {cat_clean} in {town_clean}"
            elif cat_clean:
                self.seo_heading = f"{name_clean} — {cat_clean}"
            else:
                self.seo_heading = name_clean

        # Structured data: Valid Schema.org Store / LocalBusiness JSON-LD
        if not self.structured_data:
            image_url = self.cover_image_url or self.logo_url or "https://zeleradeck.com/logo2.png"
            locality = town_clean or "Kerala"
            self.structured_data = {
                "@context": "https://schema.org",
                "@type": "Store",
                "name": name_clean,
                "description": self.seo_description,
                "url": f"https://zeleradeck.com/{self.slug}",
                "telephone": f"+{self.whatsapp_number}",
                "image": image_url,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": locality,
                    "addressRegion": "Kerala",
                    "addressCountry": "IN"
                },
                "priceRange": "₹₹"
            }

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            # If the base slug is reserved, suffix it to avoid shadowing a real route.
            if base in RESERVED_SLUGS:
                base = f"{base}-shop"
            slug = base
            n = 1
            while Shop.objects.filter(slug=slug).exists() or slug in RESERVED_SLUGS:
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug

        self.generate_seo_fields()
        super().save(*args, **kwargs)

    def regenerate_slug(self):
        """Regenerate slug from current name, ensuring uniqueness and no reserved-slug collision."""
        base = slugify(self.name)
        # If the base slug is reserved, suffix it to avoid shadowing a real route.
        if base in RESERVED_SLUGS:
            base = f"{base}-shop"
        slug = base
        n = 1
        while Shop.objects.filter(slug=slug).exclude(pk=self.pk).exists() or slug in RESERVED_SLUGS:
            slug = f"{base}-{n}"
            n += 1
        self.slug = slug

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save(update_fields=['password'])

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
