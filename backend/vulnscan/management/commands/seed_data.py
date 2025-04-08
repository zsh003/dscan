from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from vulnscan.models import Target, ScanTask, Vulnerability
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = '生成模拟数据用于演示'

    def handle(self, *args, **kwargs):
        # 创建测试用户
        if not User.objects.filter(username='test').exists():
            User.objects.create_user(
                username='test',
                password='test123',
                email='test@example.com'
            )
            self.stdout.write(self.style.SUCCESS('创建测试用户成功'))

        # 创建模拟目标
        targets = []
        for i in range(5):
            target = Target.objects.create(
                url=f'https://example{i}.com',
                name=f'测试目标 {i+1}',
                description=f'这是一个用于演示的测试目标 {i+1}',
                is_active=True
            )
            targets.append(target)
        self.stdout.write(self.style.SUCCESS('创建测试目标成功'))

        # 创建模拟扫描任务
        tasks = []
        for i in range(10):
            task = ScanTask.objects.create(
                target=random.choice(targets),
                name=f'扫描任务 {i+1}',
                status=random.choice(['pending', 'running', 'completed', 'failed']),
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            tasks.append(task)
        self.stdout.write(self.style.SUCCESS('创建扫描任务成功'))

        # 创建模拟漏洞
        vulnerability_types = [
            'SQL注入',
            'XSS跨站脚本',
            'CSRF跨站请求伪造',
            '文件上传漏洞',
            '命令注入',
            '信息泄露',
            '未授权访问',
            '目录遍历'
        ]
        severity_levels = ['low', 'medium', 'high', 'critical']

        for i in range(20):
            Vulnerability.objects.create(
                scan_task=random.choice(tasks),
                name=random.choice(vulnerability_types),
                description=f'这是一个模拟的漏洞描述 {i+1}',
                severity=random.choice(severity_levels),
                status=random.choice(['new', 'confirmed', 'fixed', 'false_positive']),
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
        self.stdout.write(self.style.SUCCESS('创建漏洞数据成功')) 