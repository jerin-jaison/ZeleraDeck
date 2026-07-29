from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0010_sync_offer_label_and_set_column_defaults'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['display_order', 'name']},
        ),
        migrations.AddField(
            model_name='category',
            name='display_order',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
