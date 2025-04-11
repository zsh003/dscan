from django.core.management.base import BaseCommand
from django.utils import timezone
from scan.models import ScanTask, ScanResult
import random
from datetime import timedelta

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
            'http://scanme.org',
            'http://webapp.example.com',
            'http://test.vulnerability.com',
            'http://security.example.org',
            'http://pentest.local',
            'http://hackme.test'
        ]

        # 漏洞类型和描述模板
        vulnerability_types = {
            'XSS': {
                'severity': 'high',
                'descriptions': [
                    '在搜索框中发现反射型XSS漏洞',
                    '在评论功能中发现存储型XSS漏洞',
                    '在用户资料页面发现DOM型XSS漏洞',
                    '在文章标题中发现XSS漏洞',
                    '在用户头像上传功能中发现XSS漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        '<script>alert(1)</script>',
                        '<img src=x onerror=alert(1)>',
                        '"><script>alert("xss")</script>',
                        '<svg/onload=alert(1)>',
                        'javascript:alert(1)//'
                    ]),
                    'parameter': random.choice(['q', 'search', 'comment', 'input', 'title', 'username'])
                }
            },
            'SQL注入': {
                'severity': 'high',
                'descriptions': [
                    '在登录页面发现SQL注入漏洞',
                    '在搜索功能中发现SQL注入漏洞',
                    '在用户查询接口发现SQL注入漏洞',
                    '在订单查询功能中发现SQL注入漏洞',
                    '在文章过滤功能中发现SQL注入漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        "' OR '1'='1",
                        "1' OR '1'='1' --",
                        "admin' --",
                        "1; DROP TABLE users--",
                        "' UNION SELECT * FROM users--"
                    ]),
                    'parameter': random.choice(['id', 'user_id', 'product_id', 'order_id', 'article_id'])
                }
            },
            '信息泄露': {
                'severity': 'medium',
                'descriptions': [
                    '发现敏感配置文件可访问',
                    '发现备份文件泄露',
                    '发现源代码泄露',
                    '发现数据库备份文件',
                    '发现服务器配置文件'
                ],
                'details': lambda: {
                    'file': random.choice([
                        '.env',
                        'config.php',
                        'backup.sql',
                        '.git/config',
                        'wp-config.php',
                        'database.yml',
                        'settings.py',
                        'web.config'
                    ]),
                    'content_type': 'text/plain'
                }
            },
            '目录遍历': {
                'severity': 'medium',
                'descriptions': [
                    '发现目录遍历漏洞',
                    '可以访问上级目录文件',
                    '存在任意文件读取漏洞',
                    '发现敏感目录未限制访问',
                    '存在路径穿越漏洞'
                ],
                'details': lambda: {
                    'payload': random.choice([
                        '../../../etc/passwd',
                        '..\\..\\..\\windows\\win.ini',
                        '%2e%2e%2f',
                        '....//....//etc/passwd',
                        '..%252f..%252f'
                    ])
                }
            },
            'CSRF': {
                'severity': 'medium',
                'descriptions': [
                    '发现表单缺少CSRF令牌',
                    '密码修改功能存在CSRF漏洞',
                    '用户设置页面存在CSRF漏洞',
                    '支付接口缺少CSRF保护',
                    '管理功能存在CSRF漏洞'
                ],
                'details': lambda: {
                    'endpoint': random.choice([
                        '/user/password/change',
                        '/admin/settings',
                        '/api/user/profile',
                        '/payment/process',
                        '/admin/users/delete'
                    ])
                }
            }
        }

        # 扫描类型列表
        scan_types = ['full', 'xss', 'sql', 'info']
        
        # 为每个URL创建多个扫描任务
        for url in target_urls:
            # 创建2-4个不同时间点的扫描任务
            for _ in range(random.randint(2, 4)):
                # 随机创建时间（过去30天内）
                created_time = timezone.now() - timedelta(
                    days=random.randint(0, 30),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
                
                # 随机完成时间（1-10分钟后）
                completed_time = created_time + timedelta(
                    minutes=random.randint(1, 10)
                )
                
                # 随机状态（90%完成，10%失败）
                status = 'completed' if random.random() < 0.9 else 'failed'
                
                task = ScanTask.objects.create(
                    target_url=url,
                    scan_type=random.choice(scan_types),
                    status=status,
                    created_at=created_time,
                    completed_at=completed_time if status == 'completed' else None
                )

                if status == 'completed':
                    # 为每个任务生成2-7个随机漏洞
                    num_vulnerabilities = random.randint(2, 7)
                    vuln_types = list(vulnerability_types.keys())
                    
                    for _ in range(num_vulnerabilities):
                        vuln_type = random.choice(vuln_types)
                        vuln_info = vulnerability_types[vuln_type]
                        
                        ScanResult.objects.create(
                            task=task,
                            vulnerability_type=vuln_type,
                            severity=vuln_info['severity'],
                            description=random.choice(vuln_info['descriptions']),
                            affected_url=f"{url}/{random.choice(['search', 'login', 'profile', 'admin', 'api', 'user', 'cart'])}",
                            details=vuln_info['details']()
                        )

                self.stdout.write(
                    self.style.SUCCESS(f'成功为 {url} 创建测试数据 - {status}')
                )

        self.stdout.write(
            self.style.SUCCESS('所有测试数据生成完成！')
        ) 