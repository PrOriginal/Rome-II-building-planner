# Generated by Django 4.2 on 2023-04-20 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('r2_gc_planner', '0003_building_category_building_trade_resources_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='building',
            name='growth',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=2),
        ),
    ]
