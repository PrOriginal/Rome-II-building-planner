from django.contrib import admin
from .models import Faction, Building, Province, City

admin.site.register(Faction)
admin.site.register(Building)
admin.site.register(Province)
admin.site.register(City)