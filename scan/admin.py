from django.contrib import admin
from .models import ScanTask, ScanResult

@admin.register(ScanTask)
class ScanTaskAdmin(admin.ModelAdmin):
    list_display = ('target_url', 'scan_type', 'status', 'created_at', 'completed_at')
    list_filter = ('status', 'scan_type')
    search_fields = ('target_url',)
    ordering = ('-created_at',)

@admin.register(ScanResult)
class ScanResultAdmin(admin.ModelAdmin):
    list_display = ('vulnerability_type', 'severity', 'affected_url', 'discovered_at')
    list_filter = ('vulnerability_type', 'severity')
    search_fields = ('affected_url', 'description')
    ordering = ('-discovered_at',)
