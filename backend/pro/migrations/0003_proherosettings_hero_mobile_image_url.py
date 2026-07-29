# Generated manually for hero_mobile_image_url field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pro', '0002_proherosettings'),
    ]

    operations = [
        migrations.AddField(
            model_name='proherosettings',
            name='hero_mobile_image_url',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
