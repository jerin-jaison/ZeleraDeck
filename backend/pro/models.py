"""
ZeleraDeck Pro Admin — Models
New models scoped entirely to the `pro` app.
No changes to accounts or catalogue models.
"""

import uuid
from django.db import models


class ProAboutBlock(models.Model):
    """An ordered content block on the Pro storefront About page."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(
        "accounts.Shop",
        on_delete=models.CASCADE,
        related_name="pro_about_blocks",
    )
    heading = models.CharField(max_length=200)
    body = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"{self.shop.slug} — {self.heading}"


class ProContactInfo(models.Model):
    """Contact info for the Pro storefront Contact page. One row per shop."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.OneToOneField(
        "accounts.Shop",
        on_delete=models.CASCADE,
        related_name="pro_contact_info",
    )

    # Address
    address_line1 = models.CharField(max_length=255, blank=True, default="")
    address_line2 = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    postal_code = models.CharField(max_length=20, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="India")

    # Contact
    phone = models.CharField(max_length=20, blank=True, default="")
    whatsapp_override = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="Override WhatsApp number. If blank, falls back to shop phone.",
    )
    email = models.EmailField(blank=True, default="")

    # Business hours (text per day — e.g. "10:00–20:00" or "Closed")
    hours_mon = models.CharField(max_length=30, blank=True, default="")
    hours_tue = models.CharField(max_length=30, blank=True, default="")
    hours_wed = models.CharField(max_length=30, blank=True, default="")
    hours_thu = models.CharField(max_length=30, blank=True, default="")
    hours_fri = models.CharField(max_length=30, blank=True, default="")
    hours_sat = models.CharField(max_length=30, blank=True, default="")
    hours_sun = models.CharField(max_length=30, blank=True, default="Closed")

    # Google Maps embed URL or iframe src
    google_maps_embed_url = models.URLField(max_length=1000, blank=True, default="")

    # Social links
    instagram_url = models.URLField(max_length=300, blank=True, default="")
    facebook_url = models.URLField(max_length=300, blank=True, default="")
    youtube_url = models.URLField(max_length=300, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Contact info for {self.shop.slug}"


class ProHeroSettings(models.Model):
    """Hero section settings for the Pro storefront Home page. One row per shop."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.OneToOneField(
        "accounts.Shop",
        on_delete=models.CASCADE,
        related_name="pro_hero_settings",
    )

    # The background image for the hero section
    hero_image_url = models.URLField(max_length=500, blank=True, default="")

    # The large headline text (e.g. "The New Monochrome")
    hero_headline = models.CharField(max_length=200, blank=True, default="")

    # Optional sub-headline / tagline
    hero_subheading = models.CharField(max_length=300, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hero settings for {self.shop.slug}"
