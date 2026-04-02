from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.models import Shop


class ShopJWTAuthentication(BaseAuthentication):
    """Authenticates shop owners via JWT tokens that contain shop_id in the payload."""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        token_str = auth_header.split(' ', 1)[1]

        try:
            token = AccessToken(token_str)
        except TokenError as e:
            raise AuthenticationFailed(f'Invalid or expired token: {e}')

        shop_id = token.get('shop_id')
        if not shop_id:
            raise AuthenticationFailed('Token does not contain shop_id.')

        try:
            shop = Shop.objects.get(pk=shop_id)
        except Shop.DoesNotExist:
            raise AuthenticationFailed('Shop not found.')

        # ── Token version check (force-logout on disable / pw reset) ─────
        token_version_in_token = token.get('token_version', 0)
        if token_version_in_token != shop.token_version:
            raise AuthenticationFailed(
                'Session expired. Please log in again.'
            )


        # ── Subscription Expiry check ────────────────────────────────────
        if shop.expires_at and shop.expires_at < timezone.now():
            raise AuthenticationFailed(
                'Your subscription has expired. Contact support.'
            )

        # ── Active check ─────────────────────────────────────────────────
        if not shop.is_active:
            raise AuthenticationFailed(
                'Your store has been deactivated. Contact support.'
            )

        return (shop, token)
