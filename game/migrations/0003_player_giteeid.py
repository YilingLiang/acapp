# Generated by Django 3.2.8 on 2021-12-25 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_player_openid'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='giteeid',
            field=models.CharField(blank=True, default='', max_length=50, null=True),
        ),
    ]
