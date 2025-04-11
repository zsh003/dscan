from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScanTaskViewSet, ScanResultViewSet

router = DefaultRouter()
router.register(r'tasks', ScanTaskViewSet)
router.register(r'results', ScanResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 