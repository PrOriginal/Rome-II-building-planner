# Generated by Django 4.2 on 2023-04-20 13:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('r2_gc_planner', '0005_alter_building_bonus_agriculture_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='city',
            old_name='building_limit',
            new_name='building_slots',
        ),
        migrations.RemoveField(
            model_name='city',
            name='default_building',
        ),
    ]