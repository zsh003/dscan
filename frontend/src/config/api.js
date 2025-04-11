const API_BASE_URL = 'http://localhost:8000/api'

// 获取存储的token
const getToken = () => localStorage.getItem('token')

// 创建通用的请求头
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }
  return headers
}

// API端点
const endpoints = {
  login: `${API_BASE_URL}/token-auth/`,
  targets: `${API_BASE_URL}/targets/`,
  scanTasks: `${API_BASE_URL}/scantasks/`,
  vulnerabilities: `${API_BASE_URL}/vulnerabilities/`,
  ws: 'ws://localhost:8000/ws'
}

// API方法
export const api = {
  // 登录
  async login(username, password) {
    const response = await fetch(endpoints.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    if (!response.ok) {
      throw new Error('登录失败')
    }
    const data = await response.json()
    localStorage.setItem('token', data.token)
    return data
  },

  // 获取目标列表
  async getTargets() {
    const response = await fetch(endpoints.targets, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('获取目标列表失败')
    }
    return response.json()
  },

  // 添加目标
  async addTarget(target) {
    const response = await fetch(endpoints.targets, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(target)
    })
    if (!response.ok) {
      throw new Error('添加目标失败')
    }
    return response.json()
  },

  // 删除目标
  async deleteTarget(id) {
    const response = await fetch(`${endpoints.targets}${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('删除目标失败')
    }
  },

  // 获取扫描任务列表
  async getScanTasks() {
    const response = await fetch(endpoints.scanTasks, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('获取扫描任务列表失败')
    }
    return response.json()
  },

  // 创建扫描任务
  async createScanTask(task) {
    const response = await fetch(endpoints.scanTasks, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    })
    if (!response.ok) {
      throw new Error('创建扫描任务失败')
    }
    return response.json()
  },

  // 删除扫描任务
  async deleteScanTask(id) {
    const response = await fetch(`${endpoints.scanTasks}${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('删除扫描任务失败')
    }
  },

  // 获取漏洞列表
  async getVulnerabilities() {
    const response = await fetch(endpoints.vulnerabilities, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('获取漏洞列表失败')
    }
    return response.json()
  }
}

export default endpoints 