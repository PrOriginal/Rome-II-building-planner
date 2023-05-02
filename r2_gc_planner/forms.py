from django import forms
from itertools import groupby
from django.forms.widgets import Select
from .models import Province, Building, Faction

class ProvinceForm(forms.Form):
    province = forms.ModelChoiceField(queryset=Province.objects.all())

class BuildingForm(forms.Form):
    buildings = Building.objects.order_by('category', 'id')
    grouped_buildings = [(None, "Select"),]
    for category, buildings in groupby(buildings, key=lambda b: b.category):
        building_choices = [(b.id, b.name) for b in buildings]
        grouped_buildings.append((category, building_choices))

    building_choice = forms.ChoiceField(
        choices=grouped_buildings,
        label=False, 
        initial= "",
        )
    building_choice.widget.attrs.update({
        "class": "building-input",
        "required":False,
    })

class FactionForm(forms.Form):
    faction = forms.ModelChoiceField(queryset=Faction.objects.all())
    