import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { scanApi } from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    recentTasks: [],
    vulnerabilityStats: {
      high: 0,
      medium: 0,
      low: 0
    },
    taskStatusStats: {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 获取所有任务
      const response = await scanApi.getAllTasks();
      const tasks = response || [];

      // 统计任务状态
      const taskStatusStats = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      // 获取最近5个任务的详细信息和漏洞统计
      const recentTasks = tasks.slice(0, 5);
      const vulnerabilityStats = { high: 0, medium: 0, low: 0 };

      // 获取每个任务的漏洞信息
      const taskDetailsPromises = recentTasks.map(task => 
        scanApi.getResults(task.id)
      );
      const taskResults = await Promise.all(taskDetailsPromises);

      // 统计漏洞数量
      taskResults.forEach(results => {
        results.forEach(vuln => {
          if (vuln.severity === 'high') vulnerabilityStats.high++;
          else if (vuln.severity === 'medium') vulnerabilityStats.medium++;
          else if (vuln.severity === 'low') vulnerabilityStats.low++;
        });
      });

      setDashboardData({
        totalTasks: tasks.length,
        recentTasks: recentTasks,
        vulnerabilityStats,
        taskStatusStats
      });
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const vulnerabilityData = [
    { name: '高危漏洞', value: dashboardData.vulnerabilityStats.high, color: '#ff4d4f' },
    { name: '中危漏洞', value: dashboardData.vulnerabilityStats.medium, color: '#faad14' },
    { name: '低危漏洞', value: dashboardData.vulnerabilityStats.low, color: '#52c41a' },
  ];

  const taskStatusData = [
    { name: '等待中', value: dashboardData.taskStatusStats.pending || 0, color: '#d9d9d9' },
    { name: '扫描中', value: dashboardData.taskStatusStats.running || 0, color: '#1890ff' },
    { name: '已完成', value: dashboardData.taskStatusStats.completed || 0, color: '#52c41a' },
    { name: '失败', value: dashboardData.taskStatusStats.failed || 0, color: '#ff4d4f' },
  ];

  const columns = [
    {
      title: '目标URL',
      dataIndex: 'target_url',
      key: 'target_url',
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>系统概览</h2>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={dashboardData.totalTasks}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高危漏洞"
              value={dashboardData.vulnerabilityStats.high}
              valueStyle={{ color: '#ff4d4f' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="中危漏洞"
              value={dashboardData.vulnerabilityStats.medium}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="低危漏洞"
              value={dashboardData.vulnerabilityStats.low}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="漏洞分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vulnerabilityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {vulnerabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="任务状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="最近扫描任务" style={{ marginTop: '16px' }}>
        <Table
          columns={columns}
          dataSource={dashboardData.recentTasks}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;