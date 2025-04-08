import { createStore } from 'vuex'
import axios from 'axios'

const API_URL = 'https://localhost:8000/api'

export default createStore({
  state: {
    targets: [],
    tasks: [],
    vulnerabilities: [],
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  },
  mutations: {
    setTargets(state, targets) {
      state.targets = targets
    },
    setTasks(state, tasks) {
      state.tasks = tasks
    },
    setVulnerabilities(state, vulnerabilities) {
      state.vulnerabilities = vulnerabilities
    },
    addTarget(state, target) {
      state.targets.push(target)
    },
    addTask(state, task) {
      state.tasks.push(task)
    },
    setToken(state, token) {
      state.token = token
      state.isAuthenticated = !!token
      if (token) {
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Token ${token}`
      } else {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/token-auth/`, credentials)
        commit('setToken', response.data.token)
        return true
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    logout({ commit }) {
      commit('setToken', null)
    },
    async fetchTargets({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/targets/`)
        commit('setTargets', response.data)
      } catch (error) {
        console.error('Error fetching targets:', error)
        if (error.response && error.response.status === 401) {
          commit('setToken', null)
        }
        throw error
      }
    },
    async fetchTasks({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/scantasks/`)
        commit('setTasks', response.data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        if (error.response && error.response.status === 401) {
          commit('setToken', null)
        }
        throw error
      }
    },
    async fetchVulnerabilities({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/vulnerabilities/`)
        commit('setVulnerabilities', response.data)
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error)
        if (error.response && error.response.status === 401) {
          commit('setToken', null)
        }
        throw error
      }
    },
    async createTarget({ commit }, targetData) {
      try {
        const response = await axios.post(`${API_URL}/targets/`, targetData)
        commit('addTarget', response.data)
        return response.data
      } catch (error) {
        console.error('Error creating target:', error)
        if (error.response && error.response.status === 401) {
          commit('setToken', null)
        }
        throw error
      }
    },
    async createScanTask({ commit }, taskData) {
      try {
        const response = await axios.post(`${API_URL}/scantasks/`, taskData)
        commit('addTask', response.data)
        return response.data
      } catch (error) {
        console.error('Error creating scan task:', error)
        if (error.response && error.response.status === 401) {
          commit('setToken', null)
        }
        throw error
      }
    }
  },
  getters: {
    getTargetById: (state) => (id) => {
      return state.targets.find(target => target.id === id)
    },
    getTasksByTargetId: (state) => (targetId) => {
      return state.tasks.filter(task => task.target === targetId)
    },
    getVulnerabilitiesByTaskId: (state) => (taskId) => {
      return state.vulnerabilities.filter(vuln => vuln.scan_task === taskId)
    },
    isAuthenticated: state => state.isAuthenticated
  }
}) 