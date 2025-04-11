from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import ScanTask, ScanResult
from .serializers import ScanTaskSerializer, ScanResultSerializer
from .scanner import VulnerabilityScanner
import threading

# Create your views here.

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
