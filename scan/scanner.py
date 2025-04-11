import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
from concurrent.futures import ThreadPoolExecutor
from .models import ScanResult

class VulnerabilityScanner:
    def __init__(self, target_url):
        self.target_url = target_url
        self.session = requests.Session()
        self.visited_urls = set()
        
    def is_same_domain(self, url):
        """检查URL是否属于同一域名"""
        target_domain = urlparse(self.target_url).netloc
        url_domain = urlparse(url).netloc
        return target_domain == url_domain
    
    def get_links(self, html, base_url):
        """从HTML中提取链接"""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            url = urljoin(base_url, a['href'])
            if self.is_same_domain(url) and url not in self.visited_urls:
                links.append(url)
        return links

    def test_xss(self, url, params):
        """测试XSS漏洞"""
        payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            '<img src=x onerror=alert(1)>',
        ]
        results = []
        
        for payload in payloads:
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                try:
                    response = self.session.get(url, params=test_params)
                    if payload in response.text:
                        results.append({
                            'vulnerability_type': 'XSS',
                            'severity': 'high',
                            'description': f'在参数 {param} 中发现反射型XSS漏洞',
                            'affected_url': url,
                            'details': {'payload': payload, 'param': param}
                        })
                except:
                    continue
        return results

    def test_sql_injection(self, url, params):
        """测试SQL注入漏洞"""
        payloads = [
            "' OR '1'='1",
            "1' OR '1'='1",
            "1; SELECT * FROM users--",
        ]
        results = []
        
        for payload in payloads:
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                try:
                    response = self.session.get(url, params=test_params)
                    # 这里简单检测是否返回了额外的数据或错误信息
                    if 'error' in response.text.lower() or 'sql' in response.text.lower():
                        results.append({
                            'vulnerability_type': 'SQL注入',
                            'severity': 'high',
                            'description': f'在参数 {param} 中发现可能的SQL注入漏洞',
                            'affected_url': url,
                            'details': {'payload': payload, 'param': param}
                        })
                except:
                    continue
        return results

    def test_info_disclosure(self, url):
        """测试信息泄露"""
        sensitive_files = [
            '/robots.txt',
            '/.git/config',
            '/.env',
            '/config.php',
            '/wp-config.php',
        ]
        results = []
        
        base_url = urlparse(url).scheme + '://' + urlparse(url).netloc
        for file in sensitive_files:
            try:
                response = self.session.get(urljoin(base_url, file))
                if response.status_code == 200:
                    results.append({
                        'vulnerability_type': '信息泄露',
                        'severity': 'medium',
                        'description': f'发现敏感文件: {file}',
                        'affected_url': urljoin(base_url, file),
                        'details': {'file': file, 'content_length': len(response.content)}
                    })
            except:
                continue
        return results

    def scan_url(self, url):
        """扫描单个URL"""
        if url in self.visited_urls:
            return []
        
        self.visited_urls.add(url)
        results = []
        
        try:
            # 获取页面内容
            response = self.session.get(url)
            parsed_url = urlparse(url)
            params = dict(pair.split('=') for pair in parsed_url.query.split('&')) if parsed_url.query else {}
            
            # 进行各种漏洞测试
            results.extend(self.test_xss(url, params))
            results.extend(self.test_sql_injection(url, params))
            results.extend(self.test_info_disclosure(url))
            
            # 获取新的链接
            new_links = self.get_links(response.text, url)
            return results, new_links
        except:
            return [], []

    def scan(self, task):
        """开始扫描"""
        to_scan = [self.target_url]
        max_urls = 10  # 限制扫描的URL数量
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            while to_scan and len(self.visited_urls) < max_urls:
                current_url = to_scan.pop(0)
                results, new_links = self.scan_url(current_url)
                
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
                to_scan.extend(new_links) 