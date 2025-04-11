import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Descriptions, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    form.setFieldsValue({
      email: user.email,
      phone: user.phone,
      department: user.department,
      position: user.position,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const success = await updateProfile(values);
      if (success) {
        message.success('个人信息更新成功');
        setIsEditing(false);
      } else {
        message.error('更新失败，请重试');
      }
    } catch (error) {
      message.error('更新失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const ViewMode = () => (
    <>
      <Descriptions
        bordered
        column={1}
        labelStyle={{ width: '150px', fontWeight: 'bold' }}
      >
        <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
        <Descriptions.Item label="手机号码">{user.phone || '未设置'}</Descriptions.Item>
        <Descriptions.Item label="部门">{user.department || '未设置'}</Descriptions.Item>
        <Descriptions.Item label="职位">{user.position || '未设置'}</Descriptions.Item>
        <Descriptions.Item label="最后登录时间">
          {user.last_login ? new Date(user.last_login).toLocaleString() : '未记录'}
        </Descriptions.Item>
        <Descriptions.Item label="最后登录IP">{user.last_login_ip || '未记录'}</Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button type="primary" onClick={handleEdit}>
          编辑信息
        </Button>
      </div>
    </>
  );

  const EditMode = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={{
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
      }}
    >
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input prefix={<MailOutlined />} />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号码"
        rules={[
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
        ]}
      >
        <Input prefix={<PhoneOutlined />} />
      </Form.Item>

      <Form.Item
        name="department"
        label="部门"
      >
        <Input prefix={<TeamOutlined />} />
      </Form.Item>

      <Form.Item
        name="position"
        label="职位"
      >
        <Input prefix={<BankOutlined />} />
      </Form.Item>

      <Form.Item
        name="old_password"
        label="原密码"
      >
        <Input.Password placeholder="如需修改密码，请输入原密码" />
      </Form.Item>

      <Form.Item
        name="new_password"
        label="新密码"
        dependencies={['old_password']}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value && !getFieldValue('old_password')) {
                return Promise.resolve();
              }
              if (value && value.length < 6) {
                return Promise.reject('密码长度至少为6个字符');
              }
              if (value && !getFieldValue('old_password')) {
                return Promise.reject('请输入原密码');
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.Password placeholder="如需修改密码，请输入新密码" />
      </Form.Item>

      <Form.Item style={{ textAlign: 'center' }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
          <Button onClick={handleCancel}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <Card>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        个人信息
      </Title>
      {isEditing ? <EditMode /> : <ViewMode />}
    </Card>
  );
};

export default UserProfilePage; 