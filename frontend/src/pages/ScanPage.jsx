import React, { useState } from 'react';
import { Layout, message } from 'antd';
import ScanForm from '../components/ScanForm';
import ScanResults from '../components/ScanResults';
import { scanApi } from '../services/api';

const { Content } = Layout;

const ScanPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 创建扫描任务
      const task = await scanApi.createTask(values);
      setCurrentTask(task);
      
      // 开始扫描
      await scanApi.startScan(task.id);
      message.success('扫描任务已开始');
      
      // 轮询获取结果
      const pollResults = async () => {
        const taskStatus = await scanApi.getTaskStatus(task.id);
        if (taskStatus.status === 'completed') {
          const scanResults = await scanApi.getResults(task.id);
          setResults(scanResults);
          setLoading(false);
          message.success('扫描完成！');
        } else if (taskStatus.status === 'failed') {
          setLoading(false);
          message.error('扫描失败');
        } else {
          // 继续轮询
          setTimeout(pollResults, 2000);
        }
      };
      
      pollResults();
    } catch (error) {
      setLoading(false);
      message.error('操作失败：' + error.message);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <ScanForm onSubmit={handleSubmit} loading={loading} />
        {results.length > 0 && <ScanResults results={results} />}
      </Content>
    </Layout>
  );
};

export default ScanPage; 