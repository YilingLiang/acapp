# Generated by Django 3.2.8 on 2022-01-22 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_player_giteeid'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='score',
            field=models.IntegerField(default=1500),
        ),
    ]
