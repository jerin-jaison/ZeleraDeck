import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password, check_password


class Shop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220)
    phone = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    # Only increments. Never decrements. Used for display_id generation.
    product_counter = models.PositiveIntegerField(default=0)

    # ── Shop profile ─────────────────────────────────────────────────────────
    logo_url = models.URLField(max_length=500, blank=True, null=True)

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

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            n = 1
            while Shop.objects.filter(slug=slug).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def regenerate_slug(self):
        """Regenerate slug from current name, ensuring uniqueness."""
        base = slugify(self.name)
        slug = base
        n = 1
        while Shop.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base}-{n}"
            n += 1
        self.slug = slug

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save(update_fields=['password'])

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
