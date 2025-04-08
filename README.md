# DScan - Web应用漏洞扫描系统

DScan是一个基于Django和Vue的Web应用漏洞扫描系统，提供多种安全扫描功能。

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
- 前端：Vue.js
- 数据库：SQLite（可配置为MySQL或PostgreSQL）
- 任务队列：Celery + Redis

## 安装说明

1. 克隆仓库：
```bash
git clone [repository-url]
cd dscan
```

2. 安装后端依赖：
```bash
python -m venv venv
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
python manage.py migrate
```

6. 启动开发服务器：
- 后端：`python manage.py runserver`
- 前端：`cd frontend && npm run serve`

## 使用说明

访问 http://localhost:8080 即可使用Web界面进行扫描操作。

## 注意事项

- 请确保在合法授权的情况下使用本工具
- 建议在测试环境中使用
- 部分扫描功能可能需要root/管理员权限 