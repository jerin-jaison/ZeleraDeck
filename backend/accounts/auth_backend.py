from accounts.models import Shop


class PhonePasswordBackend:
    """Custom authentication backend that uses phone + password instead of username."""

    def authenticate(self, request, phone=None, password=None, **kwargs):
        try:
            shop = Shop.objects.get(phone=phone, is_active=True)
        except Shop.DoesNotExist:
            return None

        if shop.check_password(password):
            return shop
        return None

    def get_user(self, user_id):
        try:
            return Shop.objects.get(pk=user_id)
        except Shop.DoesNotExist:
            return None
