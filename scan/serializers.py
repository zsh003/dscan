from rest_framework import serializers
from .models import ScanTask, ScanResult

class ScanResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanResult
        fields = ['id', 'vulnerability_type', 'severity', 'description', 
                 'affected_url', 'details', 'discovered_at']

class ScanTaskSerializer(serializers.ModelSerializer):
    results = ScanResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = ScanTask
        fields = ['id', 'target_url', 'scan_type', 'status', 
                 'created_at', 'completed_at', 'results']
        read_only_fields = ['status', 'created_at', 'completed_at'] 