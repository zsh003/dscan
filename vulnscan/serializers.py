from rest_framework import serializers
from .models import Target, ScanTask, Vulnerability

class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ['id', 'url', 'ip', 'description', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ScanTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanTask
        fields = ['id', 'target', 'scan_type', 'status', 'created_at', 'started_at', 'completed_at', 'created_by']
        read_only_fields = ['status', 'created_by', 'started_at', 'completed_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class VulnerabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vulnerability
        fields = ['id', 'scan_task', 'title', 'description', 'severity', 'solution', 'created_at']
        read_only_fields = ['created_at'] 