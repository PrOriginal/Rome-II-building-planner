from django.contrib import admin
from django.urls import path
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.main_table),
    path('get_cities/<int:province_id>/', views.get_cities, name='get_cities'),
    path('get_building_icon/<int:building_id>/', views.get_building_icon, name='building_icon'),
    path('buildings_form/', views.buildings_form, name='buildings_form'),
    path('get_total/', views.get_total, name='get_total'),
]
