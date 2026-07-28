from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Migration 0009 ensures SiteSettings is in state without throwing
    DuplicateTable in DB (since 0007 already created accounts_sitesettings).
    """

    dependencies = [
        ('accounts', '0008_moderationlog_staffaccount_supportticket_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
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
            ],
            database_operations=[],
        ),
    ]

