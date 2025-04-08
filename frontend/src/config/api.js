const API_BASE_URL = 'http://localhost:8000/api'

export default {
  targets: `${API_BASE_URL}/targets/`,
  scanTasks: `${API_BASE_URL}/scantasks/`,
  vulnerabilities: `${API_BASE_URL}/vulnerabilities/`,
  ws: 'ws://localhost:8000/ws'
} 