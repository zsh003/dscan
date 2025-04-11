from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from scan.views import (
    LoginView,
    UserViewSet,
    ScanTaskViewSet,
    ScanResultViewSet
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tasks', ScanTaskViewSet)
router.register(r'results', ScanResultViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]