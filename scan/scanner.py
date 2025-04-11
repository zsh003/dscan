import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
import random
import time
from concurrent.futures import ThreadPoolExecutor
from .models import ScanResult

class VulnerabilityScanner:
    def __init__(self, target_url):
        self.target_url = target_url
        self.session = requests.Session()
        self.visited_urls = set()
        
        # 模拟漏洞模板
        self.vulnerability_templates = {
            'XSS': {
                'severity': 'high',
                'descriptions': [
                    '在搜索框中发现反射型XSS漏洞',
                    '在评论功能中发现存储型XSS漏洞',
                    '在用户资料页面发现DOM型XSS漏洞'
                ],
                'payloads': [
                    '<script>alert(1)</script>',
                    '<img src=x onerror=alert(1)>',
                    '"><script>alert("xss")</script>'
                ]
            },
            'SQL注入': {
                'severity': 'high',
                'descriptions': [
                    '在登录页面发现SQL注入漏洞',
                    '在搜索功能中发现SQL注入漏洞',
                    '在用户查询接口发现SQL注入漏洞'
                ],
                'payloads': [
                    "' OR '1'='1",
                    "1' OR '1'='1' --",
                    "admin' --"
                ]
            },
            '信息泄露': {
                'severity': 'medium',
                'descriptions': [
                    '发现敏感配置文件可访问',
                    '发现备份文件泄露',
                    '发现源代码泄露'
                ],
                'files': [
                    '.env',
                    'config.php',
                    'backup.sql',
                    '.git/config'
                ]
            }
        }

    def simulate_scan_delay(self):
        """模拟扫描延迟"""
        time.sleep(random.uniform(0.5, 2.0))

    def simulate_vulnerability_check(self, url, check_type):
        """模拟漏洞检查"""
        self.simulate_scan_delay()
        
        # 随机决定是否"发现"漏洞
        if random.random() < 0.3:  # 30%的概率发现漏洞
            template = self.vulnerability_templates[check_type]
            return {
                'vulnerability_type': check_type,
                'severity': template['severity'],
                'description': random.choice(template['descriptions']),
                'affected_url': url,
                'details': {
                    'payload': random.choice(template.get('payloads', [])) if 'payloads' in template else None,
                    'file': random.choice(template.get('files', [])) if 'files' in template else None
                }
            }
        return None

    def scan_url(self, url):
        """扫描单个URL"""
        if url in self.visited_urls:
            return []
        
        self.visited_urls.add(url)
        results = []
        
        # 模拟各种漏洞检查
        for vuln_type in self.vulnerability_templates.keys():
            result = self.simulate_vulnerability_check(url, vuln_type)
            if result:
                results.append(result)
        
        # 模拟发现新的URL
        new_urls = [
            f"{url}/{path}" for path in ['login', 'admin', 'search', 'profile']
            if random.random() < 0.3
        ]
        
        return results, new_urls

    def scan(self, task):
        """开始扫描"""
        to_scan = [self.target_url]
        max_urls = 10  # 限制扫描的URL数量
        
        while to_scan and len(self.visited_urls) < max_urls:
            current_url = to_scan.pop(0)
            results, new_urls = self.scan_url(current_url)
            
            # 保存扫描结果
            for result in results:
                ScanResult.objects.create(
                    task=task,
                    vulnerability_type=result['vulnerability_type'],
                    severity=result['severity'],
                    description=result['description'],
                    affected_url=result['affected_url'],
                    details=result['details']
                )
            
            # 添加新的URL到扫描队列
            to_scan.extend([url for url in new_urls if url not in self.visited_urls])
            
            # 模拟扫描延迟
            self.simulate_scan_delay() 