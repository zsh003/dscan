from rest_framework import serializers
from .models import ScanTask, ScanResult, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'department', 'position', 'last_login', 'last_login_ip']
        read_only_fields = ['last_login', 'last_login_ip']

class UserUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'phone', 'department', 'position', 'old_password', 'new_password']

    def validate(self, data):
        if 'new_password' in data and not data.get('old_password'):
            raise serializers.ValidationError("修改密码时必须提供原密码")
        return data

    def update(self, instance, validated_data):
        if 'new_password' in validated_data:
            old_password = validated_data.pop('old_password')
            if not instance.check_password(old_password):
                raise serializers.ValidationError("原密码错误")
            instance.set_password(validated_data.pop('new_password'))
        
        return super().update(instance, validated_data)

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