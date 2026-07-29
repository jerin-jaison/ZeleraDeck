"""
pro/safety.py
=============
WRITE-PROTECTION GUARD
──────────────────────
This module provides a safety guard for Pro admin write operations.

Historically, La Bella was hardcoded to be write-protected. Her account has now been
removed from the write-guard blocklist so she can manage her store freely.
The write guard infrastructure is preserved so any shop can be added to
`BLOCKED_SHOP_SLUGS` / `BLOCKED_SHOP_UUIDS` if write restrictions are needed.

For La Bella, write operations are logged for audit purposes but NO LONGER BLOCKED.
"""

import logging
import uuid
from datetime import datetime, timezone

from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("pro.safety")

# ── Immutable identifiers for La Bella ───────────────────────────────────────
_LABELLA_UUID = uuid.UUID("79a6e69e-4ca7-4113-909f-d3d4b5918f44")
_LABELLA_SLUG = "la-bella"

# ── Write-Guard Blocklist (Add shop UUIDs or slugs here if write restriction is needed) ──
BLOCKED_SHOP_UUIDS = set()
BLOCKED_SHOP_SLUGS = set()


def _is_labella(shop) -> bool:
    """
    Returns True if `shop` is La Bella.
    """
    if not shop:
        return False
    try:
        pk_match = str(shop.pk) == str(_LABELLA_UUID)
        slug_match = (shop.slug or "").lower().strip() == _LABELLA_SLUG
        return pk_match or slug_match
    except Exception:
        return False


def _is_blocked_shop(shop) -> bool:
    """
    Returns True if `shop` matches any entry in the active blocklist.
    """
    if not shop:
        return False
    try:
        if shop.pk in BLOCKED_SHOP_UUIDS or str(shop.pk) in BLOCKED_SHOP_UUIDS:
            return True
        if (shop.slug or "").lower().strip() in BLOCKED_SHOP_SLUGS:
            return True
    except Exception:
        pass
    return False


def check_labella_write_guard(shop, endpoint: str):
    """
    Call this at the VERY START of any Pro admin write handler.

    - If `shop` is in `BLOCKED_SHOP_SLUGS`/`BLOCKED_SHOP_UUIDS`, logs the blocked attempt
      and returns a 403 Response.
    - If `shop` is La Bella, records an audit log entry for the write action and returns None
      (allowing the operation to proceed).
    - For all other shops, returns None.

    Usage in a view:
        guard = check_labella_write_guard(request.user, "ProAdminProductDeleteView.delete")
        if guard:
            return guard

    Returns
    -------
    rest_framework.response.Response  — if blocked (return this immediately)
    None                              — if safe to proceed
    """
    ts = datetime.now(timezone.utc).isoformat()

    # 1. Audit log write actions for La Bella (no longer blocked)
    if _is_labella(shop):
        logger.info(
            "[LA_BELLA_GUARD] WRITE_ACTION | shop=%s | id=%s | slug=%s | endpoint=%s | at=%s",
            getattr(shop, 'name', 'Unknown'),
            getattr(shop, 'pk', 'Unknown'),
            getattr(shop, 'slug', 'Unknown'),
            endpoint,
            ts,
        )
        return None

    # 2. Hard block for any shop explicitly added to the blocklist
    if _is_blocked_shop(shop):
        logger.error(
            "[WRITE_GUARD] BLOCKED | shop=%s | id=%s | slug=%s | endpoint=%s | at=%s",
            getattr(shop, 'name', 'Unknown'),
            getattr(shop, 'pk', 'Unknown'),
            getattr(shop, 'slug', 'Unknown'),
            endpoint,
            ts,
        )
        return Response(
            {
                "error": (
                    "Write operations are restricted for this account. "
                    "Contact ZeleraDeck support if you believe this is incorrect."
                ),
                "code": "WRITE_BLOCKED",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return None

