from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import logout
from .models import ScanTask, ScanResult, User
from .serializers import (
    ScanTaskSerializer, 
    ScanResultSerializer, 
    UserSerializer,
    UserUpdateSerializer,
    UserRegisterSerializer
)
from .scanner import VulnerabilityScanner
import threading

# Create your views here.

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # 更新用户的最后登录信息
            user = User.objects.get(username=request.data['username'])
            user.last_login = timezone.now()
            user.last_login_ip = request.META.get('REMOTE_ADDR')
            user.save()
            
            # 添加用户信息到响应
            response.data['user'] = UserSerializer(user).data
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_superuser:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get','patch'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        if request.method == 'PATCH':
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."})
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data, context={'is_registration': True})
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': '注册成功',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ScanTaskViewSet(viewsets.ModelViewSet):
    queryset = ScanTask.objects.all()
    serializer_class = ScanTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return ScanTask.objects.all()
        return ScanTask.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
