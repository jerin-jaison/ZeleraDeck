from django.db import migrations


class Migration(migrations.Migration):
    """
    Cleanup migration: removes all DB artefacts from the abandoned
    plans/suspension/moderation feature that was added in 0008 but
    never implemented in application code.

    Drops from accounts_shop:
        - plan
        - suspension_level
        - suspension_date
        - suspension_reason
        - custom_domain

    Drops entire tables:
        - accounts_moderationlog
        - accounts_staffaccount
        - accounts_supportticket
    """

    dependencies = [
        ('accounts', '0009_recreate_sitesettings'),
    ]

    operations = [
        # ── Remove unused Shop columns ────────────────────────────────────────
        migrations.RemoveField(model_name='shop', name='plan'),
        migrations.RemoveField(model_name='shop', name='suspension_level'),
        migrations.RemoveField(model_name='shop', name='suspension_date'),
        migrations.RemoveField(model_name='shop', name='suspension_reason'),
        migrations.RemoveField(model_name='shop', name='custom_domain'),

        # ── Drop unused moderation/staff/ticket tables ────────────────────────
        migrations.DeleteModel(name='ModerationLog'),
        migrations.DeleteModel(name='StaffAccount'),
        migrations.DeleteModel(name='SupportTicket'),
    ]
