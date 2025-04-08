import { createRouter, createWebHistory } from 'vue-router'
import TargetList from '../views/TargetList.vue'
import TaskList from '../views/TaskList.vue'
import VulnerabilityList from '../views/VulnerabilityList.vue'

const routes = [
  {
    path: '/',
    redirect: '/targets'
  },
  {
    path: '/targets',
    name: 'Targets',
    component: TargetList
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TaskList
  },
  {
    path: '/vulnerabilities',
    name: 'Vulnerabilities',
    component: VulnerabilityList
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 