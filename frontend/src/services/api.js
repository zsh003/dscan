import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}; 