# DScan - Web应用漏洞扫描可视化展示系统

DScan是一个基于Django和React的Web应用漏洞扫描可视化展示系统，提供多种安全扫描功能和结果展示方案。

## 功能特性

- IP存活扫描
- 端口扫描
- 操作系统识别
- SQL注入检测
- XSS漏洞扫描
- 目录扫描
- 敏感信息泄露检测

## 技术栈

- 后端：Django + Django REST framework
- 前端：React + Ant Design
- 数据库：SQLite

## 安装说明

1. 克隆仓库：
```bash
git clone [repository-url]
cd dscan
```

2. 安装后端依赖：
```bash
python -m venv .venv
source venv/bin/activate  # Windows使用: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. 安装前端依赖：
```bash
cd frontend
npm install
```

4. 配置环境变量：
复制`.env.example`到`.env`并填写必要的配置信息

5. 运行数据库迁移：
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py makemigrations scan
python manage.py migrate scan
python manage.py generate_test_users
python manage.py generate_test_data
```

6. 生成SSL证书

```bash
cd certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt
```

7. 启动开发服务器：
- 后端SSL启动：`python manage.py runserver_plus --cert-file ./certificate/localhost.crt --key-file ./certificate/localhost.key`
- 前端：`cd frontend && npm run serve`

1. 访问系统
- 前端界面：https://localhost:3000
- 后端API：https://localhost:8000/api/
- 管理界面：https://localhost:8000/admin/
  
账号密码：admin/123456

## 使用说明

访问 https://localhost:3000 即可使用Web界面进行扫描操作。

## 注意事项

- 请确保在合法授权的情况下使用本工具
- 建议在测试环境中使用
- 部分扫描功能可能需要root/管理员权限 