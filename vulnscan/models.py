from django.db import models
from django.contrib.auth.models import User

class Target(models.Model):
    """扫描目标"""
    url = models.URLField(verbose_name='目标URL')
    ip = models.GenericIPAddressField(verbose_name='IP地址', null=True, blank=True)
    description = models.TextField(verbose_name='描述', blank=True)
    created_at = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name='更新时间', auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='创建者')

    class Meta:
        verbose_name = '扫描目标'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return self.url

class ScanTask(models.Model):
    """扫描任务"""
    SCAN_TYPES = (
        ('port', '端口扫描'),
        ('os', '操作系统扫描'),
        ('sql', 'SQL注入扫描'),
        ('xss', 'XSS扫描'),
        ('dir', '目录扫描'),
        ('info', '信息泄露扫描'),
    )

    STATUS_CHOICES = (
        ('pending', '等待中'),
        ('running', '扫描中'),
        ('completed', '已完成'),
        ('failed', '失败'),
    )

    target = models.ForeignKey(Target, on_delete=models.CASCADE, verbose_name='扫描目标')
    scan_type = models.CharField(max_length=10, choices=SCAN_TYPES, verbose_name='扫描类型')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    created_at = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
    started_at = models.DateTimeField(verbose_name='开始时间', null=True, blank=True)
    completed_at = models.DateTimeField(verbose_name='完成时间', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='创建者')

    class Meta:
        verbose_name = '扫描任务'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_scan_type_display()} - {self.target.url}'

class Vulnerability(models.Model):
    """漏洞信息"""
    SEVERITY_CHOICES = (
        ('low', '低危'),
        ('medium', '中危'),
        ('high', '高危'),
        ('critical', '严重'),
    )

    scan_task = models.ForeignKey(ScanTask, on_delete=models.CASCADE, verbose_name='扫描任务')
    title = models.CharField(max_length=200, verbose_name='漏洞标题')
    description = models.TextField(verbose_name='漏洞描述')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, verbose_name='危险等级')
    solution = models.TextField(verbose_name='修复建议', blank=True)
    created_at = models.DateTimeField(verbose_name='发现时间', auto_now_add=True)

    class Meta:
        verbose_name = '漏洞信息'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return self.title
