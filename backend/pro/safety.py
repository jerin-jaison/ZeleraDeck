"""
pro/safety.py
=============
PERMANENT WRITE-PROTECTION GUARD FOR LA BELLA
──────────────────────────────────────────────
This module provides a hardcoded, unconditional safety check that rejects
any Pro admin write operation targeting the La Bella shop.

RATIONALE
---------
This is an independent, second layer of protection on top of the normal
owner-scoping / JWT checks. Even if there were a bug in the JWT scoping
logic that allowed the wrong shop owner to call a write endpoint, this
guard will still reject the request before any DB mutation occurs.

SCOPE
-----
Must be called at the very top of every Pro admin view method that
performs a write (POST, PUT, PATCH, DELETE) — BEFORE any other logic.

PERMANENCE
----------
DO NOT remove or conditionally disable this guard without an explicit
written instruction from the shop owner. It must remain active in all
environments: local, staging, and production.

LOG FORMAT
----------
Every blocked attempt is logged at ERROR level with:
  [LA_BELLA_GUARD] BLOCKED | shop={name} | id={id} | slug={slug} | endpoint={endpoint} | at={timestamp}
"""

import logging
import uuid
from datetime import datetime, timezone

from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("pro.safety")

# ── La Bella's immutable identifiers (looked up 2026-07-17, must not be changed) ──
_LABELLA_UUID = uuid.UUID("79a6e69e-4ca7-4113-909f-d3d4b5918f44")
_LABELLA_SLUG = "la-bella"


def _is_labella(shop) -> bool:
    """
    Returns True if `shop` is La Bella, matched by BOTH primary key UUID
    and slug. Both must match to avoid false positives from UUID collisions
    or slug re-use.
    """
    try:
        pk_match = str(shop.pk) == str(_LABELLA_UUID)
        slug_match = (shop.slug or "").lower().strip() == _LABELLA_SLUG
        return pk_match and slug_match
    except Exception:
        # If comparison itself fails, default to blocking (fail-safe).
        return True


def check_labella_write_guard(shop, endpoint: str):
    """
    Call this at the VERY START of any Pro admin write handler.

    If `shop` is La Bella, logs the blocked attempt and returns an error
    Response. If it is NOT La Bella, returns None (caller proceeds normally).

    Usage in a view:
        guard = check_labella_write_guard(request.user, "ProAdminProductDeleteView.delete")
        if guard:
            return guard

    Parameters
    ----------
    shop    : accounts.models.Shop instance (request.user after JWT auth)
    endpoint: Human-readable name of the calling view/method

    Returns
    -------
    rest_framework.response.Response  — if blocked (return this immediately)
    None                              — if safe to proceed
    """
    if _is_labella(shop):
        ts = datetime.now(timezone.utc).isoformat()
        logger.error(
            "[LA_BELLA_GUARD] BLOCKED | shop=%s | id=%s | slug=%s | endpoint=%s | at=%s",
            shop.name,
            shop.pk,
            shop.slug,
            endpoint,
            ts,
        )
        return Response(
            {
                "error": (
                    "Write operations are permanently restricted for this account. "
                    "Contact ZeleraDeck support if you believe this is incorrect."
                ),
                "code": "LABELLA_WRITE_BLOCKED",
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    return None
