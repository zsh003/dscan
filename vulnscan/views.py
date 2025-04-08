from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Target, ScanTask, Vulnerability
from .serializers import TargetSerializer, ScanTaskSerializer, VulnerabilitySerializer
from .tasks import run_port_scan, run_os_scan, run_sql_scan, run_xss_scan, run_dir_scan, run_info_scan

# Create your views here.

class TargetViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Target.objects.filter(created_by=self.request.user)

class ScanTaskViewSet(viewsets.ModelViewSet):
    queryset = ScanTask.objects.all()
    serializer_class = ScanTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScanTask.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        scan_task = serializer.save()
        self._start_scan_task(scan_task)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        scan_task = self.get_object()
        if scan_task.status == 'pending':
            self._start_scan_task(scan_task)
            return Response({'status': 'scan started'})
        return Response({'status': 'scan already started'})

    def _start_scan_task(self, scan_task):
        scan_task.status = 'running'
        scan_task.started_at = timezone.now()
        scan_task.save()

        scan_functions = {
            'port': run_port_scan,
            'os': run_os_scan,
            'sql': run_sql_scan,
            'xss': run_xss_scan,
            'dir': run_dir_scan,
            'info': run_info_scan,
        }

        scan_function = scan_functions.get(scan_task.scan_type)
        if scan_function:
            scan_function.delay(scan_task.id)

class VulnerabilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vulnerability.objects.all()
    serializer_class = VulnerabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vulnerability.objects.filter(scan_task__created_by=self.request.user)
