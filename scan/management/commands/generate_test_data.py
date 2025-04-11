from django.core.management.base import BaseCommand
from django.utils import timezone
from scan.models import ScanTask, ScanResult
import random

class Command(BaseCommand):
    help = '生成测试数据用于开发和演示'

    def handle(self, *args, **options):
        # 清除现有数据
        ScanTask.objects.all().delete()
        ScanResult.objects.all().delete()

        # 示例URL列表
        target_urls = [
            'http://example.com',
            'http://testsite.com',
            'http://demo.local',
            'http://vuln.test',
            'http://scanme.org'
        ]

        # 漏洞类型和描述模板
        vulnerability_types = {
            'XSS': {
                'severity': 'high',
                'descriptions': [
                    '在搜索框中发现反射型XSS漏洞',
                    '在评论功能中发现存储型XSS漏洞',
                    '在用户资料页面发现DOM型XSS漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        '<script>alert(1)</script>',
                        '<img src=x onerror=alert(1)>',
                        '"><script>alert("xss")</script>'
                    ]),
                    'parameter': random.choice(['q', 'search', 'comment', 'input'])
                }
            },
            'SQL注入': {
                'severity': 'high',
                'descriptions': [
                    '在登录页面发现SQL注入漏洞',
                    '在搜索功能中发现SQL注入漏洞',
                    '在用户查询接口发现SQL注入漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        "' OR '1'='1",
                        "1' OR '1'='1' --",
                        "admin' --"
                    ]),
                    'parameter': random.choice(['id', 'user_id', 'product_id'])
                }
            },
            '信息泄露': {
                'severity': 'medium',
                'descriptions': [
                    '发现敏感配置文件可访问',
                    '发现备份文件泄露',
                    '发现源代码泄露'
                ],
                'details': lambda: {
                    'file': random.choice([
                        '.env',
                        'config.php',
                        'backup.sql',
                        '.git/config'
                    ]),
                    'content_type': 'text/plain'
                }
            },
            '目录遍历': {
                'severity': 'medium',
                'descriptions': [
                    '发现目录遍历漏洞',
                    '可以访问上级目录文件',
                    '存在任意文件读取漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        '../../../etc/passwd',
                        '..\\..\\..\\windows\\win.ini',
                        '%2e%2e%2f'
                    ])
                }
            }
        }

        # 为每个URL创建扫描任务和结果
        for url in target_urls:
            # 创建扫描任务
            task = ScanTask.objects.create(
                target_url=url,
                scan_type='full',
                status='completed',
                created_at=timezone.now(),
                completed_at=timezone.now()
            )

            # 为每个任务生成2-5个随机漏洞
            num_vulnerabilities = random.randint(2, 5)
            vuln_types = list(vulnerability_types.keys())
            
            for _ in range(num_vulnerabilities):
                vuln_type = random.choice(vuln_types)
                vuln_info = vulnerability_types[vuln_type]
                
                ScanResult.objects.create(
                    task=task,
                    vulnerability_type=vuln_type,
                    severity=vuln_info['severity'],
                    description=random.choice(vuln_info['descriptions']),
                    affected_url=f"{url}/{random.choice(['search', 'login', 'profile', 'admin'])}",
                    details=vuln_info['details']()
                )

            self.stdout.write(
                self.style.SUCCESS(f'成功为 {url} 创建测试数据')
            )

        self.stdout.write(
            self.style.SUCCESS('所有测试数据生成完成！')
        ) 