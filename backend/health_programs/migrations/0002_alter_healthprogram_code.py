# Generated by Django 5.2 on 2025-04-26 23:05

import health_programs.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('health_programs', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthprogram',
            name='code',
            field=models.CharField(max_length=10, unique=True, validators=[health_programs.models.validate_non_empty_code]),
        ),
    ]
