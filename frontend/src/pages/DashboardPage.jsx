import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { scanApi } from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalScans: 0,
    completedScans: 0,
    failedScans: 0,
    vulnerabilities: {
      total: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  });
  const [vulnerabilityTrends, setVulnerabilityTrends] = useState([]);
  const [vulnerabilityTypes, setVulnerabilityTypes] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const tasks = await scanApi.getAllTasks();
      const results = await scanApi.getAllResults();
      
      // 处理统计数据
      const stats = {
        totalScans: tasks.results.length,
        completedScans: tasks.results.filter(t => t.status === 'completed').length,
        failedScans: tasks.results.filter(t => t.status === 'failed').length,
        vulnerabilities: {
          total: results.length,
          high: results.filter(r => r.severity === 'high').length,
          medium: results.filter(r => r.severity === 'medium').length,
          low: results.filter(r => r.severity === 'low').length
        }
      };
      setStatistics(stats);

      // 处理漏洞类型分布
      const typeCount = {};
      results.forEach(result => {
        typeCount[result.vulnerability_type] = (typeCount[result.vulnerability_type] || 0) + 1;
      });
      setVulnerabilityTypes(Object.entries(typeCount).map(([name, value]) => ({ name, value })));

      // 处理最近扫描
      setRecentScans(tasks.results.slice(0, 5));

      // 处理趋势数据（按日期分组）
      const trends = {};
      results.forEach(result => {
        const date = new Date(result.discovered_at).toLocaleDateString();
        if (!trends[date]) {
          trends[date] = { date, high: 0, medium: 0, low: 0 };
        }
        trends[date][result.severity]++;
      });
      setVulnerabilityTrends(Object.values(trends));

    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentScansColumns = [
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
          'completed': { color: 'success', text: '已完成' },
          'failed': { color: 'error', text: '失败' },
          'running': { color: 'processing', text: '扫描中' },
          'pending': { color: 'default', text: '等待中' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '完成时间',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总扫描任务" value={statistics.totalScans} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已完成扫描" 
              value={statistics.completedScans}
              suffix={`/ ${statistics.totalScans}`} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="发现漏洞总数" 
              value={statistics.vulnerabilities.total} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="高危漏洞" 
              value={statistics.vulnerabilities.high}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="漏洞趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vulnerabilityTrends}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="high" stroke="#cf1322" name="高危" />
                <Line type="monotone" dataKey="medium" stroke="#faad14" name="中危" />
                <Line type="monotone" dataKey="low" stroke="#52c41a" name="低危" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="漏洞类型分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vulnerabilityTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 最近扫描 */}
      <Card title="最近扫描任务" style={{ marginBottom: 24 }}>
        <Table
          columns={recentScansColumns}
          dataSource={recentScans}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;