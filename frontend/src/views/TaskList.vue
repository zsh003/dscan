<template>
  <div class="task-list">
    <div class="page-header">
      <h1>扫描任务</h1>
    </div>

    <el-table :data="tasks" style="width: 100%">
      <el-table-column label="目标" width="300">
        <template #default="scope">
          {{ getTargetUrl(scope.row.target) }}
        </template>
      </el-table-column>
      <el-table-column prop="scan_type" label="扫描类型" width="150">
        <template #default="scope">
          {{ getScanTypeName(scope.row.scan_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="completed_at" label="完成时间" width="180">
        <template #default="scope">
          {{ scope.row.completed_at ? new Date(scope.row.completed_at).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="viewVulnerabilities(scope.row)"
            :disabled="scope.row.status !== 'completed'"
          >
            查看结果
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'TaskList',
  setup() {
    const store = useStore()
    const router = useRouter()
    const tasks = ref([])

    const fetchTasks = async () => {
      await store.dispatch('fetchTasks')
      tasks.value = store.state.tasks
    }

    const getTargetUrl = (targetId) => {
      const target = store.getters.getTargetById(targetId)
      return target ? target.url : '-'
    }

    const getScanTypeName = (type) => {
      const types = {
        'port': '端口扫描',
        'os': '操作系统扫描',
        'sql': 'SQL注入扫描',
        'xss': 'XSS扫描',
        'dir': '目录扫描',
        'info': '信息泄露扫描'
      }
      return types[type] || type
    }

    const getStatusName = (status) => {
      const statuses = {
        'pending': '等待中',
        'running': '扫描中',
        'completed': '已完成',
        'failed': '失败'
      }
      return statuses[status] || status
    }

    const getStatusType = (status) => {
      const types = {
        'pending': 'info',
        'running': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return types[status] || ''
    }

    const viewVulnerabilities = (task) => {
      router.push({
        name: 'Vulnerabilities',
        query: { taskId: task.id }
      })
    }

    onMounted(() => {
      fetchTasks()
      // 定期刷新任务状态
      setInterval(fetchTasks, 5000)
    })

    return {
      tasks,
      getTargetUrl,
      getScanTypeName,
      getStatusName,
      getStatusType,
      viewVulnerabilities
    }
  }
}
</script>

<style scoped>
.task-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}
</style> 