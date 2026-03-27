from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Recreates the SiteSettings table that was dropped by migration 0006.
    The table is needed for global maintenance mode toggle.
    """

    dependencies = [
        ('accounts', '0006_delete_sitesettings'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('maintenance_mode', models.BooleanField(default=False)),
                ('maintenance_message', models.TextField(blank=True, default="We are currently under maintenance. We'll be back shortly.")),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Site Settings',
            },
        ),
    ]
