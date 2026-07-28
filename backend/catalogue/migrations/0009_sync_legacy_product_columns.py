"""
0009_sync_legacy_product_columns.py
====================================
The Render production PostgreSQL database contains several boolean columns on
catalogue_product that were created by old migrations that were later deleted
or squashed without dropping the DB columns. This causes IntegrityError on
every INSERT because PostgreSQL enforces NOT NULL on those columns but Django's
ORM doesn't include them in the INSERT statement.

This migration uses RunSQL with IF NOT EXISTS to safely add any missing legacy
columns. It is idempotent: if the column already exists in the DB it does
nothing; if it doesn't exist it creates it with a default of FALSE.

Columns handled:
    is_trending      — legacy flag, never used in current code
    is_new_product   — legacy flag, never used in current code

Columns already in the model (handled in previous migrations):
    is_best_product  — 0009 migration context
    is_offer_product — 0009 migration context
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0008_category_image_url'),
    ]

    operations = [
        # Add is_trending if it doesn't exist (legacy column in Render DB)
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
        # Add is_new_product if it doesn't exist (legacy column in Render DB)
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
        # Ensure is_best_product exists with correct default
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
        # Ensure is_offer_product exists with correct default
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
        # Add the Django model fields so ORM knows about them
        migrations.AddField(
            model_name='product',
            name='is_trending',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='is_new_product',
            field=models.BooleanField(default=False),
        ),
    ]
