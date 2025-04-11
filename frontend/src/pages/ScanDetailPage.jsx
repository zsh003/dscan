import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Tag, Button, Typography, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { scanApi } from '../services/api';

const { Title } = Typography;

const ScanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const taskData = await scanApi.getTaskDetail(id);
      setData(taskData);
    } catch (error) {
      console.error('获取扫描详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!data) return <div>未找到数据</div>;

  const columns = [
    {
      title: '漏洞类型',
      dataIndex: 'vulnerability_type',
      key: 'vulnerability_type',
    },
    {
      title: '风险等级',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colorMap = {
          'high': 'red',
          'medium': 'orange',
          'low': 'green'
        };
        return (
          <Tag color={colorMap[severity]}>
            {severity === 'high' ? '高危' : 
             severity === 'medium' ? '中危' : '低危'}
          </Tag>
        );
      }
    },
    {
      title: '影响URL',
      dataIndex: 'affected_url',
      key: 'affected_url',
    },
    {
      title: '发现时间',
      dataIndex: 'discovered_at',
      key: 'discovered_at',
      render: (time) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/history')}
        style={{ marginBottom: 16 }}
      >
        返回扫描历史
      </Button>

      <Title level={2}>扫描详情 #{id}</Title>
      
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered>
          <Descriptions.Item label="目标URL">{data.target_url}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(data.created_at).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="完成时间">
            {data.completed_at ? new Date(data.completed_at).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={
              data.status === 'completed' ? 'success' :
              data.status === 'running' ? 'processing' :
              data.status === 'failed' ? 'error' : 'default'
            }>
              {data.status === 'completed' ? '已完成' :
               data.status === 'running' ? '扫描中' :
               data.status === 'failed' ? '失败' : '等待中'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="扫描结果" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={data.results}
          rowKey="id"
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions title="详细信息" bordered column={2}>
                <Descriptions.Item label="漏洞描述">{record.description}</Descriptions.Item>
                <Descriptions.Item label="修复建议">{record.solution}</Descriptions.Item>
                {record.details && Object.entries(record.details).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default ScanDetailPage;