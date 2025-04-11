from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import concurrent.futures
import time

class VulnerabilityScanViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def start_scan(self, request):
        url = request.data.get('url')
        depth = request.data.get('depth', 1)
        scan_types = request.data.get('scanTypes', ['sql', 'xss'])

        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 初始化扫描结果
        scan_result = {
            'url': url,
            'start_time': timezone.now(),
            'vulnerabilities': [],
            'total_urls_scanned': 0
        }

        try:
            # 检查网站可访问性
            response = requests.get(url, timeout=10, verify=False)
            if response.status_code != 200:
                return Response({
                    'error': f'Unable to access URL. Status code: {response.status_code}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # 收集要扫描的URL
            urls_to_scan = self._collect_urls(url, depth)
            scan_result['total_urls_scanned'] = len(urls_to_scan)

            # 对每个URL进行漏洞扫描
            for target_url in urls_to_scan:
                if 'sql' in scan_types:
                    sql_vulns = self._scan_sql_injection(target_url)
                    scan_result['vulnerabilities'].extend(sql_vulns)
                
                if 'xss' in scan_types:
                    xss_vulns = self._scan_xss(target_url)
                    scan_result['vulnerabilities'].extend(xss_vulns)

            scan_result['end_time'] = timezone.now()
            scan_result['duration'] = (scan_result['end_time'] - scan_result['start_time']).seconds

            return Response(scan_result)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _collect_urls(self, base_url, depth):
        """收集给定深度内的所有URL"""
        collected_urls = set([base_url])
        current_depth = 0
        
        while current_depth < depth:
            new_urls = set()
            for url in collected_urls:
                try:
                    response = requests.get(url, timeout=5, verify=False)
                    soup = BeautifulSoup(response.text, 'html.parser')
                    for link in soup.find_all('a'):
                        href = link.get('href')
                        if href:
                            full_url = urljoin(url, href)
                            if urlparse(full_url).netloc == urlparse(base_url).netloc:
                                new_urls.add(full_url)
                except:
                    continue
            
            collected_urls.update(new_urls)
            current_depth += 1
        
        return list(collected_urls)

    def _scan_sql_injection(self, url):
        """SQL注入漏洞扫描"""
        vulnerabilities = []
        payloads = ["'", "1' OR '1'='1", "1; DROP TABLE users"]
        
        parsed_url = urlparse(url)
        if not parsed_url.query:
            return []

        for payload in payloads:
            try:
                # 替换URL参数值为payload
                test_url = self._inject_payload(url, payload)
                response = requests.get(test_url, timeout=5, verify=False)
                
                # 检测SQL错误信息
                if any(error in response.text.lower() for error in [
                    'sql', 'mysql', 'sqlite', 'postgresql', 'oracle',
                    'syntax error', 'unclosed quotation'
                ]):
                    vulnerabilities.append({
                        'type': 'SQL注入',
                        'url': url,
                        'payload': payload,
                        'risk': '高危',
                        'description': f'发现可能的SQL注入漏洞，测试payload: {payload}'
                    })
            except:
                continue
        
        return vulnerabilities

    def _scan_xss(self, url):
        """XSS漏洞扫描"""
        vulnerabilities = []
        payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            '<img src=x onerror=alert(1)>'
        ]

        try:
            # 获取所有表单
            response = requests.get(url, timeout=5, verify=False)
            soup = BeautifulSoup(response.text, 'html.parser')
            forms = soup.find_all('form')
            
            for form in forms:
                for payload in payloads:
                    # 模拟提交表单
                    form_data = {
                        input_field.get('name'): payload
                        for input_field in form.find_all('input')
                        if input_field.get('name')
                    }
                    
                    if form.get('method', '').lower() == 'post':
                        response = requests.post(url, data=form_data, timeout=5, verify=False)
                    else:
                        response = requests.get(url, params=form_data, timeout=5, verify=False)

                    # 检查响应中是否包含未经转义的payload
                    if payload in response.text:
                        vulnerabilities.append({
                            'type': 'XSS',
                            'url': url,
                            'payload': payload,
                            'risk': '中危',
                            'description': f'发现可能的XSS漏洞，测试payload: {payload}'
                        })
        except:
            pass

        return vulnerabilities

    def _inject_payload(self, url, payload):
        """将payload注入到URL参数中"""
        parsed = urlparse(url)
        params = []
        
        for param in parsed.query.split('&'):
            if '=' in param:
                name, value = param.split('=', 1)
                params.append(f'{name}={payload}')
            else:
                params.append(param)
        
        new_query = '&'.join(params)
        return url.replace(parsed.query, new_query) 