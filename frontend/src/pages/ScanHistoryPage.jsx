import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { scanApi } from '../services/api';

const ScanHistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await scanApi.getAllTasks();
      setData(response.results || []);
    } catch (error) {
      console.error('获取扫描历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '扫描ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '目标URL',
      dataIndex: 'target_url',
      key: 'target_url',
    },
    {
      title: '开始时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '完成时间',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
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
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => navigate(`/scan-detail/${record.id}`)}>
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Button onClick={() => handleStartScan(record.id)}>
              开始扫描
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleStartScan = async (taskId) => {
    try {
      await scanApi.startScan(taskId);
      fetchData(); // 刷新列表
    } catch (error) {
      console.error('启动扫描失败:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>扫描历史</h2>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default ScanHistoryPage;