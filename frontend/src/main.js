import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

const app = createApp(App)

app.use(ElementPlus)
app.use(store)
app.use(router)

app.mount('#app') 