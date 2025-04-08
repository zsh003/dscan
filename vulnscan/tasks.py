import nmap
import requests
from bs4 import BeautifulSoup
from celery import shared_task
from django.utils import timezone
from .models import ScanTask, Vulnerability

@shared_task
def run_port_scan(scan_task_id):
    """端口扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        nm = nmap.PortScanner()
        
        # 执行端口扫描
        nm.scan(scan_task.target.ip or scan_task.target.url, arguments='-sS -sV -p-')
        
        for host in nm.all_hosts():
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                for port in ports:
                    service = nm[host][proto][port]
                    if service['state'] == 'open':
                        Vulnerability.objects.create(
                            scan_task=scan_task,
                            title=f'开放端口: {port}/{proto}',
                            description=f'发现开放端口 {port}/{proto}\n'
                                      f'服务: {service.get("name", "unknown")}\n'
                                      f'版本: {service.get("version", "unknown")}',
                            severity='low' if port > 1024 else 'medium',
                            solution=f'如果不需要该服务，建议关闭端口 {port}'
                        )
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e

@shared_task
def run_os_scan(scan_task_id):
    """操作系统扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        nm = nmap.PortScanner()
        
        # 执行操作系统检测
        nm.scan(scan_task.target.ip or scan_task.target.url, arguments='-O')
        
        for host in nm.all_hosts():
            if 'osmatch' in nm[host]:
                for osmatch in nm[host]['osmatch']:
                    Vulnerability.objects.create(
                        scan_task=scan_task,
                        title=f'操作系统识别: {osmatch["name"]}',
                        description=f'操作系统: {osmatch["name"]}\n'
                                  f'准确度: {osmatch["accuracy"]}%\n'
                                  f'类型: {osmatch.get("osclass", [{}])[0].get("type", "unknown")}',
                        severity='medium',
                        solution='建议及时更新系统补丁，关闭不必要的服务'
                    )
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e

@shared_task
def run_sql_scan(scan_task_id):
    """SQL注入扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        target_url = scan_task.target.url
        
        # 简单的SQL注入测试
        payloads = ["'", "1' OR '1'='1", "1' AND '1'='1", "1' UNION SELECT NULL--"]
        
        for payload in payloads:
            try:
                response = requests.get(f"{target_url}?id={payload}", timeout=10)
                if any(error in response.text.lower() for error in ['sql', 'mysql', 'oracle', 'syntax']):
                    Vulnerability.objects.create(
                        scan_task=scan_task,
                        title='可能存在SQL注入漏洞',
                        description=f'在参数中注入payload: {payload}\n'
                                  f'发现潜在的SQL错误信息',
                        severity='high',
                        solution='1. 使用参数化查询\n2. 过滤特殊字符\n3. 限制数据库用户权限'
                    )
            except requests.RequestException:
                continue
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e

@shared_task
def run_xss_scan(scan_task_id):
    """XSS扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        target_url = scan_task.target.url
        
        # XSS测试向量
        payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            '"><img src=x onerror=alert(1)>',
            '"><svg onload=alert(1)>',
        ]
        
        for payload in payloads:
            try:
                response = requests.get(f"{target_url}?q={payload}", timeout=10)
                if payload in response.text:
                    Vulnerability.objects.create(
                        scan_task=scan_task,
                        title='发现XSS漏洞',
                        description=f'在参数中注入payload: {payload}\n'
                                  f'payload未被过滤，直接输出到页面',
                        severity='high',
                        solution='1. 对用户输入进行HTML编码\n2. 使用CSP策略\n3. 使用安全的框架函数'
                    )
            except requests.RequestException:
                continue
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e

@shared_task
def run_dir_scan(scan_task_id):
    """目录扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        target_url = scan_task.target.url.rstrip('/')
        
        # 常见敏感目录
        directories = [
            '/admin', '/login', '/wp-admin', '/phpinfo.php', '/phpmyadmin',
            '/config', '/backup', '/db', '/test', '/dev',
            '/.git', '/.env', '/api', '/upload', '/uploads'
        ]
        
        for directory in directories:
            try:
                response = requests.get(f"{target_url}{directory}", timeout=5)
                if response.status_code in [200, 301, 302, 403]:
                    Vulnerability.objects.create(
                        scan_task=scan_task,
                        title=f'发现敏感目录: {directory}',
                        description=f'目录: {directory}\n'
                                  f'状态码: {response.status_code}',
                        severity='medium',
                        solution='1. 禁止直接访问敏感目录\n2. 修改默认路径\n3. 添加访问控制'
                    )
            except requests.RequestException:
                continue
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e

@shared_task
def run_info_scan(scan_task_id):
    """信息泄露扫描任务"""
    try:
        scan_task = ScanTask.objects.get(id=scan_task_id)
        target_url = scan_task.target.url
        
        try:
            response = requests.get(target_url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 检查HTML注释
            comments = soup.find_all(string=lambda text: isinstance(text, str) and '<!--' in text)
            if comments:
                Vulnerability.objects.create(
                    scan_task=scan_task,
                    title='HTML注释信息泄露',
                    description=f'发现HTML注释可能包含敏感信息\n'
                              f'数量: {len(comments)}',
                    severity='low',
                    solution='移除包含敏感信息的HTML注释'
                )
            
            # 检查元数据
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                if meta.get('generator') or meta.get('author'):
                    Vulnerability.objects.create(
                        scan_task=scan_task,
                        title='Meta信息泄露',
                        description=f'发现Meta标签泄露系统信息\n'
                                  f'内容: {meta}',
                        severity='low',
                        solution='移除或修改泄露系统信息的Meta标签'
                    )
            
            # 检查响应头
            server_info = response.headers.get('Server')
            if server_info:
                Vulnerability.objects.create(
                    scan_task=scan_task,
                    title='Server信息泄露',
                    description=f'Server头泄露服务器信息\n'
                              f'Server: {server_info}',
                    severity='low',
                    solution='配置Web服务器隐藏版本信息'
                )
        
        except requests.RequestException:
            pass
        
        scan_task.status = 'completed'
        scan_task.completed_at = timezone.now()
        scan_task.save()
    
    except Exception as e:
        scan_task.status = 'failed'
        scan_task.save()
        raise e 