from django.db import migrations


class Migration(migrations.Migration):
    """
    Cleanup migration: removes `flag_reason` and `is_flagged` from the Product model
    which were added in the abandoned 0003 migration but never implemented in the
    python models. This fixes the NotNullViolation during product inserts.
    """

    dependencies = [
        ('catalogue', '0003_product_flag_reason_product_is_flagged'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='flag_reason',
        ),
        migrations.RemoveField(
            model_name='product',
            name='is_flagged',
        ),
    ]
