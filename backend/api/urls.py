from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VulnerabilityScanViewSet

router = DefaultRouter()
router.register(r'scan', VulnerabilityScanViewSet, basename='scan')

urlpatterns = [
    path('', include(router.urls)),
] 