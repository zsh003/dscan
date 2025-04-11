import React from 'react';
import { Form, Input, Select, Button, Card } from 'antd';

const { Option } = Select;

const ScanForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Card title="创建扫描任务" style={{ marginBottom: 20 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="target_url"
          label="目标URL"
          rules={[
            { required: true, message: '请输入目标URL' },
            { type: 'url', message: '请输入有效的URL' }
          ]}
        >
          <Input placeholder="请输入要扫描的URL" />
        </Form.Item>

        <Form.Item
          name="scan_type"
          label="扫描类型"
          rules={[{ required: true, message: '请选择扫描类型' }]}
        >
          <Select placeholder="请选择扫描类型">
            <Option value="full">完整扫描</Option>
            <Option value="xss">XSS漏洞</Option>
            <Option value="sql">SQL注入</Option>
            <Option value="info">信息泄露</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            开始扫描
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ScanForm; 