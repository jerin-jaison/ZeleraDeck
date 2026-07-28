"""
0009_sync_legacy_product_columns.py
====================================
The Render production PostgreSQL database contains several boolean columns on
catalogue_product that were created by old migrations that were later deleted
or squashed without dropping the DB columns.  This causes IntegrityError on
every INSERT because PostgreSQL enforces NOT NULL on those columns but Django's
ORM doesn't include them in the INSERT statement.

Strategy
--------
We use SeparateDatabaseAndState for each new field:

  * database_operations  — RunSQL with IF NOT EXISTS so that:
      - If the column is MISSING (shouldn't happen on Render, but protects
        new/local DBs) it gets created safely.
      - If the column ALREADY EXISTS the DO block is a no-op; no error.

  * state_operations     — standard AddField so Django's migration state
      records the field without issuing its own ALTER TABLE.

This makes the migration fully idempotent on any environment.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0008_category_image_url'),
    ]

    operations = [
        # ── is_trending ────────────────────────────────────────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns
                                WHERE table_name = 'catalogue_product'
                                  AND column_name = 'is_trending'
                            ) THEN
                                ALTER TABLE catalogue_product
                                ADD COLUMN is_trending boolean NOT NULL DEFAULT false;
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='product',
                    name='is_trending',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),

        # ── is_new_product ─────────────────────────────────────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns
                                WHERE table_name = 'catalogue_product'
                                  AND column_name = 'is_new_product'
                            ) THEN
                                ALTER TABLE catalogue_product
                                ADD COLUMN is_new_product boolean NOT NULL DEFAULT false;
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='product',
                    name='is_new_product',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),

        # ── is_best_product — guard in case not yet in DB ─────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns
                                WHERE table_name = 'catalogue_product'
                                  AND column_name = 'is_best_product'
                            ) THEN
                                ALTER TABLE catalogue_product
                                ADD COLUMN is_best_product boolean NOT NULL DEFAULT false;
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[],   # already in model from earlier migration
        ),

        # ── is_offer_product — guard in case not yet in DB ────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns
                                WHERE table_name = 'catalogue_product'
                                  AND column_name = 'is_offer_product'
                            ) THEN
                                ALTER TABLE catalogue_product
                                ADD COLUMN is_offer_product boolean NOT NULL DEFAULT false;
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[],   # already in model from earlier migration
        ),
    ]
