# Generated by Django 4.2 on 2023-04-20 20:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('r2_gc_planner', '0008_building_icon_faction_faction_icon_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='building',
            name='icon',
            field=models.ImageField(default='r2_gc_planner/img/building_logos/slum_default.png', upload_to='r2_gc_planner/img/building_logos'),
        ),
        migrations.AlterField(
            model_name='faction',
            name='faction_icon',
            field=models.ImageField(default='r2_gc_planner/img/faction_logos/rome.png', upload_to='r2_gc_planner/img/faction_logos'),
        ),
    ]
