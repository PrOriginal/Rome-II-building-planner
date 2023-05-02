from django.shortcuts import render
from django.http import JsonResponse
from .models import Province, City, Building, Faction
from .forms import ProvinceForm, BuildingForm, FactionForm
from django.db.models import Sum

def main_table(request):
    context = {
        "faction_form": FactionForm(),
        "province_form": ProvinceForm(), 
        "provinces":Province.objects.all(), 
        "factions":Faction.objects.all()
        }
    return render(request, "main_table.html", context)

def get_cities(request, province_id):
    cities = City.objects.filter(province_id=province_id)
    data = [{"name": city.name, "building_slots": city.building_slots} for city in cities]
    return JsonResponse(data, safe=False)

def get_building_icon(request, building_id):
    building = Building.objects.get(pk=building_id)
    serialized_data = building.serialize()
    return JsonResponse({"building.icon": serialized_data}, safe=False)

def buildings_form(request):
    form = BuildingForm()
    return render(request, "form_template.html", {"form": form})

# This view calculates and returns income and other statistics for a city based on its buildings
def get_total(request):
    try:
        # Extracts relevant data from the request.
        row_building_id_list = request.GET.getlist("row_building_id_list")
        table_building_id_list = request.GET.getlist("table_building_id_list")

        # Converting the strings to integers before passing them to the filter function
        row_building_ids = [int(id) for id in row_building_id_list[0].split(",")]
        table_building_ids = [int(id) for id in table_building_id_list[0].split(",")]
    except (IndexError, ValueError):
        return JsonResponse({"error": "Invalid request"}, status=400)

    # Filter the Building objects based on the IDs provided in the GET parameters
    row_buildings = Building.objects.filter(id__in=row_building_ids)
    # For now bonuses from the same buildings won't stack, since the objects.filter returns a QuerySet, 
    # which prevents duplicate values from being received.
    table_buidings = Building.objects.filter(id__in=table_building_ids)

    # Function that sums the wealth-related fields of a list of Building objects
    def sum_wealth(row_buildings):
        wealth = {
            "growth": 0,
            "food": 0,
            "public_order": 0,
            "loc_commerce_income": 0,
            "mar_commerce_income": 0,
            "subsistence_income": 0,
            "agriculture_income": 0,
            "industry_income": 0,
            "culture_income": 0,
        }

        # For each wealth-related field, aggregates the sum of that field across the list of buildings
        # and stores it in the corresponding value in the "wealth" dictionary
        for field in wealth.keys():
            wealth[field] = row_buildings.aggregate(total=Sum(field)).get("total", 0)
        return wealth
    
    # Function that sums the bonus-related fields of a list of Building objects
    def sum_bonuses(table_buildings):
        bonus = {
            "bonus_food": 0,
            "public_order_all": 0,
            "bonus_all": 0,
            "bonus_commerce": 0,
            "bonus_mar_commerce": 0,
            "bonus_agriculture": 0,
            "bonus_industry": 0,
            "bonus_culture": 0,
        }
        for field in bonus.keys():
            bonus[field] = table_buildings.aggregate(total=Sum(field)).get("total", 0)
        
        # Calculates additional bonus values based on the "bonus_all" field
        bonus["bonus_mar_commerce"] += bonus["bonus_commerce"] + bonus["bonus_all"]
        bonus["bonus_commerce"] += bonus["bonus_all"]
        bonus["bonus_agriculture"] += bonus["bonus_all"]
        bonus["bonus_industry"] += bonus["bonus_all"]
        bonus["bonus_culture"] += bonus["bonus_all"]
        return bonus

    def count_income(num, bonus):
        return num + num * bonus

    #Calculating total income and other features for the city.
    wealth = sum_wealth(row_buildings)
    bonus = sum_bonuses(table_buidings)
    commerce_income = count_income(wealth["loc_commerce_income"], bonus["bonus_commerce"]) + count_income(wealth["mar_commerce_income"], bonus["bonus_mar_commerce"])
    subsistence_income = count_income(wealth["subsistence_income"], bonus["bonus_all"])
    agriculture_income = count_income(wealth["agriculture_income"], bonus["bonus_agriculture"])
    industry_income = count_income(wealth["industry_income"], bonus["bonus_industry"])
    culture_income = count_income(wealth["culture_income"], bonus["bonus_culture"])
    total_income = commerce_income + subsistence_income + agriculture_income + industry_income + culture_income
    total_income = round(total_income)
    public_order = wealth["public_order"] + bonus["public_order_all"]
    food = wealth["food"] + bonus["bonus_food"]
    
    trade_resources = set([building.trade_resources for building in row_buildings if building.trade_resources != "0"])
    if trade_resources:
        trade_resources = "</br>".join(trade_resources)
    else:
        trade_resources = "None"

    data = {
        "total_income":total_income,
        "public_order":public_order,
        "trade_resources": trade_resources,
        "food":food,
        "growth": wealth["growth"],
    }
    return JsonResponse(data, safe=False)