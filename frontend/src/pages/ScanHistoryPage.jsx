import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, Modal, Spin } from 'antd';
import { scanApi } from '../services/api';
import ScanResults from '../components/ScanResults';

const ScanHistoryPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [results, setResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);

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

  // 获取特定任务的扫描结果
  const fetchTaskResults = async (taskId) => {
    setResultsLoading(true);
    try {
      const response = await scanApi.getResults(taskId);
      setResults(response);
      setModalVisible(true);
    } catch (error) {
      console.error('获取扫描结果失败:', error);
    } finally {
      setResultsLoading(false);
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
          onClick={() => {
            setSelectedTask(record);
            fetchTaskResults(record.id);
          }}
        >
          查看结果
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

      <Modal
        title={`扫描结果 - ${selectedTask?.target_url}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1200}
        footer={null}
      >
        {resultsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <ScanResults results={results} />
        )}
      </Modal>
    </div>
  );
};

export default ScanHistoryPage; 