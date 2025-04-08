import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Login from '../views/Login.vue'
import TargetList from '../views/TargetList.vue'
import TaskList from '../views/TaskList.vue'
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
    redirect: '/targets',
    meta: { requiresAuth: true }
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
    component: TaskList,
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
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 