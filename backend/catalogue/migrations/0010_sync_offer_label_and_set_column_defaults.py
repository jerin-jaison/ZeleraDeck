"""
0010_sync_offer_label_and_set_column_defaults.py
=================================================
Fixes the `offer_label` NOT NULL constraint violation that crashes product
creation on production PostgreSQL.

`offer_label` is a zombie column — it was created by a now-deleted migration,
still exists in the production DB as VARCHAR NOT NULL with no default, but is
absent from the current Django model.

This migration:
  1. Adds the `offer_label` field to Django's migration state (so the ORM
     includes it in every INSERT with default='').
  2. On PostgreSQL: if the column is missing, creates it; either way sets the
     DB-level DEFAULT to '' so future INSERTs are safe even if the ORM ever
     misses it.
  3. Also sets DB-level DEFAULT values on the other legacy boolean flag columns
     (is_best_product, is_offer_product, is_trending) which also have no DB
     default today — this makes production inserts safe even if those fields
     are ever omitted.
  4. On SQLite (local dev): adds the column if missing.

Fully idempotent — safe to run on any environment.
"""

from django.db import migrations, models


def sync_offer_label_and_defaults(apps, schema_editor):
    connection = schema_editor.connection
    vendor = connection.vendor

    with connection.cursor() as cursor:
        if vendor == 'postgresql':
            cursor.execute("""
                DO $$
                BEGIN
                    -- ── offer_label ──────────────────────────────────────────
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'catalogue_product'
                          AND column_name = 'offer_label'
                    ) THEN
                        ALTER TABLE catalogue_product
                            ADD COLUMN offer_label varchar(100) NOT NULL DEFAULT '';
                    ELSE
                        -- Column already exists — ensure it has a DB-level default
                        -- so future inserts never fail even if ORM omits the field.
                        ALTER TABLE catalogue_product
                            ALTER COLUMN offer_label SET DEFAULT '';
                        -- Backfill any existing NULLs (shouldn't exist, but be safe)
                        UPDATE catalogue_product
                            SET offer_label = ''
                            WHERE offer_label IS NULL;
                    END IF;

                    -- ── is_best_product DB default ────────────────────────────
                    ALTER TABLE catalogue_product
                        ALTER COLUMN is_best_product SET DEFAULT false;

                    -- ── is_offer_product DB default ───────────────────────────
                    ALTER TABLE catalogue_product
                        ALTER COLUMN is_offer_product SET DEFAULT false;

                    -- ── is_trending DB default ────────────────────────────────
                    ALTER TABLE catalogue_product
                        ALTER COLUMN is_trending SET DEFAULT false;

                    -- ── is_new_product DB default (may not exist yet) ─────────
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'catalogue_product'
                          AND column_name = 'is_new_product'
                    ) THEN
                        ALTER TABLE catalogue_product
                            ALTER COLUMN is_new_product SET DEFAULT false;
                    END IF;
                END $$;
            """)

        elif vendor == 'sqlite':
            cursor.execute("PRAGMA table_info(catalogue_product);")
            cols = [row[1] for row in cursor.fetchall()]
            if 'offer_label' not in cols:
                cursor.execute(
                    "ALTER TABLE catalogue_product "
                    "ADD COLUMN offer_label varchar(100) NOT NULL DEFAULT '';"
                )


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0009_sync_legacy_product_columns'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    sync_offer_label_and_defaults,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='product',
                    name='offer_label',
                    field=models.CharField(blank=True, default='', max_length=100),
                ),
            ],
        ),
    ]
