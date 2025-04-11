import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取扫描历史
export const getScanHistory = async () => {
  const response = await api.get('/tasks/');
  return response.data;
};

// 获取扫描详情
export const getScanDetail = async (id) => {
  try {
    // 获取基本信息
    const taskResponse = await api.get(`/tasks/${id}/`);
    const taskData = taskResponse.data;

    // 获取漏洞结果
    const resultsResponse = await api.get(`/tasks/${id}/results/`);
    const vulnerabilities = resultsResponse.data;

    // 统计各风险等级的漏洞数量
    const riskCounts = vulnerabilities.reduce((acc, vuln) => {
      const risk = vuln.risk_level;
      acc[`${risk}_risk`] = (acc[`${risk}_risk`] || 0) + 1;
      return acc;
    }, {});

    // 生成时间线数据
    const timelineData = vulnerabilities.reduce((acc, vuln) => {
      const date = vuln.discovery_time.split('T')[0];
      const existingEntry = acc.find(entry => entry.time === date);
      if (existingEntry) {
        existingEntry.vulnerabilities += 1;
      } else {
        acc.push({ time: date, vulnerabilities: 1 });
      }
      return acc;
    }, []);

    // 合并所有数据
    return {
      ...taskData,
      ...riskCounts,
      vulnerabilities,
      timeline_data: timelineData,
      total_urls: taskData.total_urls || 100, // 假设总URL数为100
      scanned_urls: taskData.scanned_urls || taskData.total_urls || 100, // 如果扫描完成则等于总数
    };
  } catch (error) {
    console.error('获取扫描详情失败:', error);
    throw error;
  }
};

export const scanApi = {
  // 创建扫描任务
  createTask: async (data) => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  // 开始扫描任务
  startScan: async (taskId) => {
    const response = await api.post(`/tasks/${taskId}/start_scan/`);
    return response.data;
  },

  // 获取扫描任务状态
  getTaskStatus: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/`);
    return response.data;
  },

  // 获取扫描结果
  getResults: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/results/`);
    return response.data;
  },

  // 获取所有任务
  getAllTasks: async () => {
    const response = await api.get('/tasks/');
    return response.data;
  },

  // 获取任务详情（包含结果）
  getTaskDetail: async (taskId) => {
    try {
      // 获取任务基本信息
      const taskResponse = await api.get(`/tasks/${taskId}/`);
      const taskData = taskResponse.data;

      // 获取任务的扫描结果
      const resultsResponse = await api.get(`/tasks/${taskId}/results/`);
      const results = resultsResponse.data;

      return {
        ...taskData,
        results,
      };
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw error;
    }
  },
}; 