from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_shop(shop):
    """Generate JWT access + refresh tokens for a Shop instance.
    
    Since Shop is NOT Django's User model, we manually inject shop data
    into the token payload rather than using the default user-based tokenisation.
    """
    refresh = RefreshToken()
    refresh['shop_id'] = str(shop.id)
    refresh['shop_name'] = shop.name
    refresh['slug'] = shop.slug

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
