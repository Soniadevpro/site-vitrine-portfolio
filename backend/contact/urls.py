from django.urls import path
from .views import home, contact_view

urlpatterns = [
    path("", home, name="home"),
    path("api/contact/", contact_view, name="api_contact"),
]
