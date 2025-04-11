import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, Timeline, Descriptions } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { scanApi } from '../services/api';

const SEVERITY_COLORS = {
  high: '#cf1322',
  medium: '#faad14',
  low: '#52c41a',
  info: '#1890ff'
};

const ScanDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  useEffect(() => {
    fetchScanDetails();
  }, [taskId]);

  const fetchScanDetails = async () => {
    setLoading(true);
    try {
      const taskData = await scanApi.getTaskStatus(taskId);
      const resultsData = await scanApi.getResults(taskId);
      
      setTask(taskData);
      setResults(resultsData);
      
      // 计算统计数据
      const stats = resultsData.reduce((acc, curr) => {
        acc.total++;
        acc[curr.severity] = (acc[curr.severity] || 0) + 1;
        return acc;
      }, { total: 0, high: 0, medium: 0, low: 0 });
      
      setStatistics(stats);
    } catch (error) {
      console.error('获取扫描详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = [
    { name: '高危', value: statistics.high, color: SEVERITY_COLORS.high },
    { name: '中危', value: statistics.medium, color: SEVERITY_COLORS.medium },
    { name: '低危', value: statistics.low, color: SEVERITY_COLORS.low }
  ];

  const columns = [
    {
      title: '漏洞类型',
      dataIndex: 'vulnerability_type',
      key: 'vulnerability_type',
      width: '15%',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: '10%',
      render: (severity) => (
        <Tag color={SEVERITY_COLORS[severity]}>
          {severity === 'high' ? '高危' : 
           severity === 'medium' ? '中危' : 
           severity === 'low' ? '低危' : '信息'}
        </Tag>
      ),
    },
    {
      title: '受影响URL',
      dataIndex: 'affected_url',
      key: 'affected_url',
      width: '25%',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '发现时间',
      dataIndex: 'discovered_at',
      key: 'discovered_at',
      width: '15%',
      render: (time) => new Date(time).toLocaleString(),
    }
  ];

  const expandedRowRender = (record) => (
    <Descriptions title="漏洞详情" bordered column={2}>
      {Object.entries(record.details).map(([key, value]) => (
        <Descriptions.Item key={key} label={key}>
          {typeof value === 'object' ? JSON.stringify(value) : value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/history')}
        style={{ marginBottom: 16 }}
      >
        返回扫描历史
      </Button>

      {task && (
        <>
          <Card title="扫描任务信息" style={{ marginBottom: 24 }}>
            <Descriptions bordered>
              <Descriptions.Item label="目标URL">{task.target_url}</Descriptions.Item>
              <Descriptions.Item label="扫描类型">
                {task.scan_type === 'full' ? '完整扫描' : 
                 task.scan_type === 'xss' ? 'XSS漏洞' :
                 task.scan_type === 'sql' ? 'SQL注入' : '信息泄露'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  task.status === 'completed' ? 'success' :
                  task.status === 'failed' ? 'error' :
                  task.status === 'running' ? 'processing' : 'default'
                }>
                  {task.status === 'completed' ? '已完成' :
                   task.status === 'failed' ? '失败' :
                   task.status === 'running' ? '扫描中' : '等待中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(task.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="完成时间">
                {task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={18}>
              <Card title="漏洞统计">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="漏洞总数" value={statistics.total} />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="高危漏洞" 
                      value={statistics.high} 
                      valueStyle={{ color: SEVERITY_COLORS.high }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="中危漏洞" 
                      value={statistics.medium} 
                      valueStyle={{ color: SEVERITY_COLORS.medium }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="低危漏洞" 
                      value={statistics.low} 
                      valueStyle={{ color: SEVERITY_COLORS.low }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="漏洞分布">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="漏洞详情列表">
            <Table
              columns={columns}
              dataSource={results}
              rowKey="id"
              expandable={{
                expandedRowRender,
                expandRowByClick: true
              }}
              loading={loading}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ScanDetailPage; 