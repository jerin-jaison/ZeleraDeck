import uuid
from django.db import models


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_id = models.CharField(max_length=10, editable=False)
    shop = models.ForeignKey(
        'accounts.Shop', on_delete=models.CASCADE, related_name='products'
    )
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500)
    is_in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.display_id} — {self.name} ({self.shop.name})"

    def save(self, *args, **kwargs):
        # display_id is generated on first save only.
        # NOTE: Cannot use 'if not self.pk' — UUID is assigned at instantiation.
        if not self.display_id:
            self.shop.product_counter += 1
            self.shop.save(update_fields=['product_counter'])
            self.display_id = f"PRD{self.shop.product_counter:04d}"
        super().save(*args, **kwargs)
