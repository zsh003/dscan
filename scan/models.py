from django.db import models

# Create your models here.

class ScanTask(models.Model):
    STATUS_CHOICES = [
        ('pending', '等待中'),
        ('running', '扫描中'),
        ('completed', '已完成'),
        ('failed', '失败')
    ]
    
    target_url = models.URLField(verbose_name='目标URL')
    scan_type = models.CharField(max_length=50, verbose_name='扫描类型')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='完成时间')
    
    class Meta:
        verbose_name = '扫描任务'
        verbose_name_plural = '扫描任务'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.target_url} - {self.scan_type}"

class ScanResult(models.Model):
    SEVERITY_CHOICES = [
        ('high', '高危'),
        ('medium', '中危'),
        ('low', '低危'),
        ('info', '信息')
    ]
    
    task = models.ForeignKey(ScanTask, on_delete=models.CASCADE, related_name='results', verbose_name='扫描任务')
    vulnerability_type = models.CharField(max_length=50, verbose_name='漏洞类型')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, verbose_name='严重程度')
    description = models.TextField(verbose_name='漏洞描述')
    affected_url = models.URLField(verbose_name='受影响URL')
    details = models.JSONField(verbose_name='详细信息')
    discovered_at = models.DateTimeField(auto_now_add=True, verbose_name='发现时间')
    
    class Meta:
        verbose_name = '扫描结果'
        verbose_name_plural = '扫描结果'
        ordering = ['-discovered_at']

    def __str__(self):
        return f"{self.vulnerability_type} - {self.severity}"
