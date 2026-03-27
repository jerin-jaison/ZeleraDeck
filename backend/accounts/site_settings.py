from django.db import models


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
