import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Button, message, Modal } from 'antd';
import { UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authApi.getAllUsers();
      setUsers(response);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await authApi.deleteUser(userId);
          message.success('删除成功');
          fetchUsers();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || '未设置',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text || '未设置',
    },
    {
      title: '角色',
      key: 'roles',
      render: (_, record) => (
        <Space>
          {record.is_superuser && <Tag color="red">管理员</Tag>}
          {record.is_staff && <Tag color="blue">员工</Tag>}
          {!record.is_superuser && !record.is_staff && <Tag>普通用户</Tag>}
        </Space>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (text) => text ? new Date(text).toLocaleString() : '从未登录',
    },
    {
      title: '最后登录IP',
      dataIndex: 'last_login_ip',
      key: 'last_login_ip',
      render: (text) => text || '未记录',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            disabled={record.is_superuser || record.id === currentUser.id}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="用户管理">
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default UserListPage; 