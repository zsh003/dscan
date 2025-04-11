import React from 'react';
import { Table, Tag, Card, Row, Col, Statistic } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = {
  high: '#ff4d4f',
  medium: '#faad14',
  low: '#52c41a',
  info: '#1890ff'
};

const ScanResults = ({ results }) => {
  // 统计数据
  const stats = results.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { high: 0, medium: 0, low: 0, info: 0, total: 0 });

  // 饼图数据
  const pieData = Object.entries(stats).filter(([key]) => key !== 'total')
    .map(([name, value]) => ({ name, value }));

  // 表格列定义
  const columns = [
    {
      title: '漏洞类型',
      dataIndex: 'vulnerability_type',
      key: 'vulnerability_type',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: severity => (
        <Tag color={COLORS[severity]}>
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
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总漏洞数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="高危漏洞" value={stats.high} valueStyle={{ color: COLORS.high }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="中危漏洞" value={stats.medium} valueStyle={{ color: COLORS.medium }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="低危漏洞" value={stats.low} valueStyle={{ color: COLORS.low }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="漏洞分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="漏洞详情">
            <Table
              dataSource={results}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ScanResults; 