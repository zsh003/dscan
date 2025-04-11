from django.core.management.base import BaseCommand
from django.utils import timezone
from scan.models import User
import random
from datetime import timedelta

class Command(BaseCommand):
    help = '生成测试用户数据'

    def handle(self, *args, **options):
        # 清除现有普通用户数据（保留超级用户）
        User.objects.filter(is_superuser=False).delete()

        # 部门列表
        departments = [
            '安全测试部',
            '研发部',
            '运维部',
            '安全运营部',
            '渗透测试部',
            '应急响应部',
            '安全研究院',
            '质量保障部'
        ]

        # 职位列表
        positions = [
            '安全工程师',
            '高级安全工程师',
            '安全研究员',
            '渗透测试工程师',
            '安全开发工程师',
            '安全运营工程师',
            '安全架构师',
            '安全分析师'
        ]

        # 生成测试用户
        test_users = [
            {
                'username': 'admin',
                'email': 'admin@dscan.com',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'username': 'user',
                'email': 'test@dscan.com',
                'is_staff': False,
                'is_superuser': False
            }
        ]

        # 生成20个随机用户
        for i in range(1, 21):
            username = f'user{i}'
            email = f'user{i}@dscan.com'
            department = random.choice(departments)
            position = random.choice(positions)
            phone = f'1{random.choice(["3", "5", "7", "8", "9"])}{random.randint(100000000, 999999999)}'
            
            test_users.append({
                'username': username,
                'email': email,
                'department': department,
                'position': position,
                'phone': phone,
                'is_staff': random.random() < 0.2,  # 20%概率成为staff
                'is_superuser': False
            })

        # 创建用户
        for user_data in test_users:
            username = user_data.pop('username')
            email = user_data.pop('email')
            
            # 检查用户是否已存在
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='123456',  # 所有测试用户使用相同的密码
                    **user_data
                )
                
                # 随机设置最后登录时间和IP
                if random.random() < 0.8:  # 80%的用户有登录记录
                    user.last_login = timezone.now() - timedelta(
                        days=random.randint(0, 30),
                        hours=random.randint(0, 23),
                        minutes=random.randint(0, 59)
                    )
                    user.last_login_ip = f'192.168.{random.randint(1, 254)}.{random.randint(1, 254)}'
                    user.save()

                self.stdout.write(
                    self.style.SUCCESS(f'成功创建用户: {username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'用户已存在，跳过创建: {username}')
                )

        self.stdout.write(
            self.style.SUCCESS('所有测试用户数据生成完成！')
        ) 