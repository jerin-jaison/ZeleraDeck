import os
from rest_framework.permissions import BasePermission


class IsAdminSecret(BasePermission):
    """
    Allows access only when the request includes the correct X-Admin-Key header.
    The expected key is read from the ADMIN_SECRET_KEY environment variable.
    """
    def has_permission(self, request, view):
        expected = os.environ.get('ADMIN_SECRET_KEY', '')
        provided = request.headers.get('X-Admin-Key', '')
        return bool(expected and provided == expected)

    