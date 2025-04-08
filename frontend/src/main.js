import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置axios默认值
axios.defaults.baseURL = 'https://localhost:8000'
axios.defaults.withCredentials = true

// 如果有保存的token，添加到请求头
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Token ${token}`
  store.commit('setToken', token)
}

// 添加响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      store.dispatch('logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(ElementPlus)
app.use(store)
app.use(router)

app.mount('#app') 