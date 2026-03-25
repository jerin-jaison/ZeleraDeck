import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password, check_password


class Shop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, editable=False, max_length=220)
    phone = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=255)
    whatsapp_number = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    # Only increments. Never decrements. Used for display_id generation.
    product_counter = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── DRF compatibility ──────────────────────────────────────────────────────
    # DRF's IsAuthenticated calls request.user.is_authenticated.
    # Shop is not Django's User model, so we add this manually.
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False
    # ───────────────────────────────────────────────────────────────────────────

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone})"

    def save(self, *args, **kwargs):
        # Slug is immutable — only generated on first save.
        # NOTE: Cannot use 'if not self.pk' because UUIDField(default=uuid.uuid4)
        # assigns pk at instantiation time, before save() is called.
        if not self.slug:
            base = slugify(self.name)
            slug = base
            n = 1
            while Shop.objects.filter(slug=slug).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save(update_fields=['password'])

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
