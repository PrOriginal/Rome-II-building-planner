# Generated by Django 4.2 on 2023-04-20 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('r2_gc_planner', '0002_alter_building_agriculture_income_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='building',
            name='category',
            field=models.CharField(default='Not Specified', max_length=50),
        ),
        migrations.AddField(
            model_name='building',
            name='trade_resources',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='building',
            name='name',
            field=models.CharField(default='Not Specified', max_length=50),
        ),
    ]
