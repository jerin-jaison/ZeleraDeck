from django.db import models
from django.core.cache import cache

STATUS_CACHE_KEY = "site_status_response"
STATUS_CACHE_TIMEOUT = 15


class SiteSettings(models.Model):
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(
        default="We are currently under maintenance. We'll be back shortly.",
        blank=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Settings"

    def __str__(self):
        return f"Site Settings (maintenance={'ON' if self.maintenance_mode else 'OFF'})"

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        cache.delete(STATUS_CACHE_KEY)
