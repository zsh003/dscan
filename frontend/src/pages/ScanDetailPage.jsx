import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Table, Tag, Progress, Typography } from 'antd';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getScanDetail } from '../services/api';

const { Title } = Typography;

const ScanDetailPage = () => {
  const { id } = useParams();
  const [scanData, setScanData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getScanDetail(id);
      setScanData(data);
    };
    fetchData();
  }, [id]);

  if (!scanData) return <div>加载中...</div>;

  const vulnerabilityData = [
    { name: '高危', value: scanData.high_risk || 0, color: '#ff4d4f' },
    { name: '中危', value: scanData.medium_risk || 0, color: '#faad14' },
    { name: '低危', value: scanData.low_risk || 0, color: '#52c41a' },
  ];

  const timelineData = scanData.timeline_data || [];

  return (
    <div className="scan-detail-page" style={{ padding: '24px' }}>
      <Title level={2}>扫描详情 #{id}</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="基本信息">
            <p><strong>目标URL：</strong> {scanData.target_url}</p>
            <p><strong>开始时间：</strong> {scanData.start_time}</p>
            <p><strong>结束时间：</strong> {scanData.end_time}</p>
            <p><strong>扫描状态：</strong> 
              <Tag color={scanData.status === 'completed' ? 'green' : 'blue'}>
                {scanData.status === 'completed' ? '已完成' : '进行中'}
              </Tag>
            </p>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title="漏洞分布">
            <Row>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vulnerabilityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {vulnerabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <div style={{ padding: '20px' }}>
                  <Progress
                    percent={Math.round((scanData.scanned_urls / scanData.total_urls) * 100)}
                    status="active"
                    format={percent => `${percent}% 已扫描`}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="漏洞时间线">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vulnerabilities" fill="#8884d8" name="发现漏洞数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="详细漏洞列表">
            <Table
              dataSource={scanData.vulnerabilities}
              columns={[
                { title: '漏洞类型', dataIndex: 'type', key: 'type' },
                { title: '风险等级', dataIndex: 'risk_level', key: 'risk_level',
                  render: (text) => (
                    <Tag color={text === 'high' ? 'red' : text === 'medium' ? 'orange' : 'green'}>
                      {text === 'high' ? '高危' : text === 'medium' ? '中危' : '低危'}
                    </Tag>
                  )
                },
                { title: '影响URL', dataIndex: 'affected_url', key: 'affected_url' },
                { title: '发现时间', dataIndex: 'discovery_time', key: 'discovery_time' },
                { title: '详细描述', dataIndex: 'description', key: 'description' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ScanDetailPage;