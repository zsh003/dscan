import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { scanApi } from '../services/api';

const ScanHistoryPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 获取所有任务
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await scanApi.getAllTasks();
      setTasks(response.results || []);
    } catch (error) {
      console.error('获取任务历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: '目标URL',
      dataIndex: 'target_url',
      key: 'target_url',
    },
    {
      title: '扫描类型',
      dataIndex: 'scan_type',
      key: 'scan_type',
      render: (type) => {
        const typeMap = {
          'full': '完整扫描',
          'xss': 'XSS漏洞',
          'sql': 'SQL注入',
          'info': '信息泄露'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'pending': { color: 'default', text: '等待中' },
          'running': { color: 'processing', text: '扫描中' },
          'completed': { color: 'success', text: '已完成' },
          'failed': { color: 'error', text: '失败' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString()
    },
    {
      title: '完成时间',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/scan/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="扫描任务历史" extra={<Button onClick={fetchTasks}>刷新</Button>}>
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ScanHistoryPage;