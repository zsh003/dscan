import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import TargetList from '../views/TargetList.vue'
import ScanTaskList from '../views/ScanTaskList.vue'
import VulnerabilityList from '../views/VulnerabilityList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/targets'
  },
  {
    path: '/targets',
    name: 'Targets',
    component: TargetList,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: ScanTaskList,
    meta: { requiresAuth: true }
  },
  {
    path: '/vulnerabilities',
    name: 'Vulnerabilities',
    component: VulnerabilityList,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router 