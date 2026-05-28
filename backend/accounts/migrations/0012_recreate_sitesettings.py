from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Recreates the SiteSettings table that was accidentally dropped by migration 0011.

    Migration 0011 bundled two unrelated changes:
      1. DeleteModel('SiteSettings')  ← should never have been here
      2. AddField(shop, is_pro)       ← needed and correct

    The /api/status/ endpoint and the admin maintenance-mode toggle both
    depend on accounts_sitesettings. This migration restores it.
    """

    dependencies = [
        ('accounts', '0011_shop_is_pro'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('maintenance_mode', models.BooleanField(default=False)),
                ('maintenance_message', models.TextField(
                    blank=True,
                    default="We are currently under maintenance. We'll be back shortly.",
                )),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Site Settings',
            },
        ),
    ]
