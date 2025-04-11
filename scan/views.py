from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.contrib.auth import logout
from .models import ScanTask, ScanResult, User
from .serializers import (
    ScanTaskSerializer, 
    ScanResultSerializer, 
    UserSerializer,
    UserUpdateSerializer
)
from .scanner import VulnerabilityScanner
import threading

# Create your views here.

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            user.last_login = timezone.now()
            user.last_login_ip = request.META.get('REMOTE_ADDR')
            user.save()
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."})

    @action(detail=False, methods=['post'], permission_classes=
    [permissions.AllowAny])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': '注册成功',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ScanTaskViewSet(viewsets.ModelViewSet):
    queryset = ScanTask.objects.all()
    serializer_class = ScanTaskSerializer

    def perform_scan(self, task):
        """执行扫描任务"""
        try:
            scanner = VulnerabilityScanner(task.target_url)
            scanner.scan(task)
            task.status = 'completed'
            task.completed_at = timezone.now()
        except Exception as e:
            task.status = 'failed'
        finally:
            task.save()

    @action(detail=True, methods=['post'])
    def start_scan(self, request, pk=None):
        task = self.get_object()
        if task.status == 'pending':
            task.status = 'running'
            task.save()
            
            # 在后台线程中运行扫描
            thread = threading.Thread(target=self.perform_scan, args=(task,))
            thread.start()
            
            return Response({'status': 'scan started'})
        return Response(
            {'error': 'Invalid task status'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        task = self.get_object()
        results = task.results.all()
        serializer = ScanResultSerializer(results, many=True)
        return Response(serializer.data)

class ScanResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScanResult.objects.all()
    serializer_class = ScanResultSerializer

    def get_queryset(self):
        queryset = ScanResult.objects.all()
        task_id = self.request.query_params.get('task_id', None)
        if task_id is not None:
            queryset = queryset.filter(task_id=task_id)
        return queryset
