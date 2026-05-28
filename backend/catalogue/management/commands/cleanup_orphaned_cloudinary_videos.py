# POLICY: Existing user videos are never deleted or modified regardless of size.
# POLICY: This command ONLY deletes Cloudinary assets that have NO matching video_url
#          in any Product row in the database. DB-referenced assets are NEVER touched.
"""
Management command: cleanup_orphaned_cloudinary_videos

Finds video assets stored on Cloudinary under the zeleradeck/ folder that are
NOT referenced by any Product.video_url in the database and deletes them.

This catches two classes of orphan:
  1. Videos rejected by the 5 MB size gate (before delete_by_token was added).
  2. Videos where the browser tab closed / network dropped after Cloudinary upload
     but before the product form was submitted.

Safe by design:
  - The DB is the source of truth. Any URL in Product.video_url is untouchable.
  - Only assets older than --min-age-hours (default 2) are considered, so an
    in-progress upload is never accidentally deleted.
  - --dry-run prints what would be deleted without actually deleting anything.

Usage:
  # Preview only (safe — no deletes)
  python manage.py cleanup_orphaned_cloudinary_videos --dry-run

  # Delete orphans older than 2 hours (default)
  python manage.py cleanup_orphaned_cloudinary_videos

  # Delete orphans older than 6 hours
  python manage.py cleanup_orphaned_cloudinary_videos --min-age-hours 6

Render cron (recommended — runs daily at 3 AM UTC):
  Add to Render dashboard → Cron Jobs:
    Command : python manage.py cleanup_orphaned_cloudinary_videos
    Schedule: 0 3 * * *
"""

import cloudinary.api
import cloudinary.uploader
from datetime import datetime, timezone, timedelta

from django.core.management.base import BaseCommand

from catalogue.models import Product


def _bytes_to_mb(b):
    return round(b / (1024 * 1024), 2)


class Command(BaseCommand):
    help = "Delete orphaned Cloudinary video assets not referenced in any Product row."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Print what would be deleted without actually deleting anything.",
        )
        parser.add_argument(
            "--min-age-hours",
            type=float,
            default=2.0,
            help=(
                "Only consider assets older than this many hours as orphans. "
                "Prevents accidentally deleting an in-progress upload. Default: 2."
            ),
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        min_age_hours = options["min_age_hours"]
        cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=min_age_hours)

        mode_label = "[DRY RUN] " if dry_run else ""
        self.stdout.write(
            self.style.WARNING(
                f"{mode_label}Starting Cloudinary orphan video cleanup "
                f"(min age: {min_age_hours}h, cutoff: {cutoff.strftime('%Y-%m-%d %H:%M UTC')})"
            )
        )

        # ── Step 1: Build the protected set from the database ─────────────────
        # Every video_url in any Product row is sacred — never touch these.
        protected_urls = set(
            Product.objects.exclude(video_url__isnull=True)
            .exclude(video_url="")
            .values_list("video_url", flat=True)
        )
        self.stdout.write(f"  Protected DB video URLs: {len(protected_urls)}")

        # ── Step 2: Fetch all video assets from Cloudinary ────────────────────
        # We page through the Cloudinary Admin API (max 500 per page).
        cloudinary_videos = []
        next_cursor = None

        while True:
            kwargs = {
                "resource_type": "video",
                "type": "upload",
                "prefix": "zeleradeck/",   # only our folder
                "max_results": 500,
            }
            if next_cursor:
                kwargs["next_cursor"] = next_cursor

            try:
                result = cloudinary.api.resources(**kwargs)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Cloudinary API error: {e}"))
                return

            cloudinary_videos.extend(result.get("resources", []))
            next_cursor = result.get("next_cursor")
            if not next_cursor:
                break

        self.stdout.write(f"  Cloudinary videos found: {len(cloudinary_videos)}")

        # ── Step 3: Cross-reference and identify orphans ───────────────────────
        orphans = []
        for asset in cloudinary_videos:
            # Build the full secure_url from Cloudinary metadata
            secure_url = asset.get("secure_url", "")
            created_at_str = asset.get("created_at", "")

            # Parse creation time
            try:
                created_at = datetime.fromisoformat(
                    created_at_str.replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                # Can't parse time — skip to be safe
                continue

            # Skip assets that are too new (might be an upload in progress)
            if created_at > cutoff:
                continue

            # Skip if this URL is referenced in any Product row — NEVER delete
            if secure_url in protected_urls:
                continue

            # Also check eager transform URLs — Cloudinary may return the base URL
            # but the DB may store the eager (compressed) URL which differs slightly.
            # We check if any protected URL *contains* the asset's public_id.
            public_id = asset.get("public_id", "")
            if any(public_id in url for url in protected_urls):
                continue

            orphans.append(asset)

        self.stdout.write(
            self.style.WARNING(f"  Orphaned videos to delete: {len(orphans)}")
        )

        if not orphans:
            self.stdout.write(self.style.SUCCESS("  Nothing to clean up. Cloudinary is tidy!"))
            return

        # ── Step 4: Delete orphans (or just report in dry-run mode) ───────────
        deleted = 0
        skipped = 0
        freed_bytes = 0

        for asset in orphans:
            public_id = asset.get("public_id", "")
            size_bytes = asset.get("bytes", 0)
            created_at = asset.get("created_at", "unknown")

            if dry_run:
                self.stdout.write(
                    f"  [DRY RUN] Would delete: {public_id} "
                    f"({_bytes_to_mb(size_bytes)} MB, uploaded {created_at})"
                )
                freed_bytes += size_bytes
                deleted += 1
            else:
                try:
                    cloudinary.uploader.destroy(public_id, resource_type="video")
                    self.stdout.write(
                        f"  Deleted: {public_id} "
                        f"({_bytes_to_mb(size_bytes)} MB, uploaded {created_at})"
                    )
                    freed_bytes += size_bytes
                    deleted += 1
                except Exception as e:
                    self.stderr.write(
                        self.style.ERROR(f"  Failed to delete {public_id}: {e}")
                    )
                    skipped += 1

        # ── Summary ────────────────────────────────────────────────────────────
        action = "Would free" if dry_run else "Freed"
        self.stdout.write(
            self.style.SUCCESS(
                f"\n{mode_label}Done. "
                f"{'Would delete' if dry_run else 'Deleted'}: {deleted} | "
                f"Skipped (errors): {skipped} | "
                f"{action}: {_bytes_to_mb(freed_bytes)} MB"
            )
        )
