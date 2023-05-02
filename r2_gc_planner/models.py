from django.db import models
import base64
from django.core.serializers import serialize

class Faction(models.Model):
    name = models.CharField(max_length=50)
    faction_icon = models.ImageField(upload_to="r2_gc_planner/static/r2_gc_planner/img/faction_logos", default="r2_gc_planner/static/r2_gc_planner/img/faction_logos/rome.png")
    
    #For the string representation of the objects in the Form
    def __str__(self):
        return self.name

class Building(models.Model):
    name = models.CharField(max_length=50, default="Not Specified")
    faction = models.ForeignKey(Faction, on_delete=models.PROTECT)
    category = models.CharField(max_length=50, default="Not Specified")
    trade_resources = models.CharField(max_length=20, default="0")
    growth = models.IntegerField(default=0)
    food = models.IntegerField(default=0)
    bonus_food = models.IntegerField(default=0)
    public_order = models.IntegerField(default=0)
    public_order_all = models.IntegerField(default=0)
    loc_commerce_income = models.IntegerField(default=0)
    mar_commerce_income = models.IntegerField(default=0)
    subsistence_income = models.IntegerField(default=0)
    agriculture_income = models.IntegerField(default=0)
    lstock_income = models.IntegerField(default=0)
    industry_income = models.IntegerField(default=0)
    culture_income = models.IntegerField(default=0)
    bonus_all = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_commerce = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_mar_commerce = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_agriculture = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_lstock = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_industry = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    bonus_culture = models.DecimalField(max_digits=2,decimal_places=2, default=0.0)
    icon = models.ImageField(upload_to="r2_gc_planner/static/r2_gc_planner/img/building_logos", default="r2_gc_planner/static/r2_gc_planner/img/building_logos/slum_default.png")

    def __str__(self):
        return self.name
    
    def serialize(self):
        """
        Returns a dictionary representation of the Building object, including the
        id and base64-encoded data of the building's icon image file.
        """
        with open(self.icon.path, 'rb') as f:
            icon_data = base64.b64encode(f.read()).decode('utf-8')
            return {
                'id': self.id,
                'icon_data': icon_data,
            }

class Province(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=50)
    province = models.ForeignKey(Province, on_delete=models.PROTECT)
    building_slots = models.IntegerField( default=6)

    def __str__(self):
        return self.name