<template>
  <div class="scan-task-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>扫描任务列表</span>
        </div>
      </template>
      
      <el-table :data="scanTasks" style="width: 100%">
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="target.name" label="目标" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="completed_at" label="完成时间">
          <template #default="scope">
            {{ scope.row.completed_at ? new Date(scope.row.completed_at).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="viewDetails(scope.row)"
              :disabled="scope.row.status !== 'completed'"
            >
              查看详情
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteTask(scope.row)"
              :disabled="scope.row.status === 'running'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="detailsVisible" title="扫描任务详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="目标">{{ currentTask.target?.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentTask.status)">
            {{ getStatusText(currentTask.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ new Date(currentTask.created_at).toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ currentTask.completed_at ? new Date(currentTask.completed_at).toLocaleString() : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="vulnerabilities-section">
        <h3>发现的漏洞</h3>
        <el-table :data="currentTask.vulnerabilities" style="width: 100%">
          <el-table-column prop="title" label="漏洞名称" />
          <el-table-column prop="type" label="类型" />
          <el-table-column label="严重程度">
            <template #default="scope">
              <el-tag :type="getSeverityType(scope.row.severity)">
                {{ scope.row.severity }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../config/api'

export default {
  name: 'ScanTaskList',
  setup() {
    const scanTasks = ref([])
    const detailsVisible = ref(false)
    const currentTask = ref({})

    // 获取扫描任务列表
    const fetchScanTasks = async () => {
      try {
        const response = await fetch(api.scanTasks)
        scanTasks.value = await response.json()
      } catch (error) {
        ElMessage.error('获取扫描任务列表失败')
      }
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        'pending': 'info',
        'running': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        'pending': '等待中',
        'running': '运行中',
        'completed': '已完成',
        'failed': '失败'
      }
      return texts[status] || status
    }

    // 获取严重程度类型
    const getSeverityType = (severity) => {
      const types = {
        'critical': 'danger',
        'high': 'warning',
        'medium': 'info',
        'low': 'success'
      }
      return types[severity] || 'info'
    }

    // 查看任务详情
    const viewDetails = async (task) => {
      try {
        const response = await fetch(`${api.scanTasks}${task.id}/`)
        currentTask.value = await response.json()
        detailsVisible.value = true
      } catch (error) {
        ElMessage.error('获取任务详情失败')
      }
    }

    // 删除任务
    const deleteTask = async (task) => {
      try {
        await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`${api.scanTasks}${task.id}/`, {
          method: 'DELETE'
        })
        if (response.ok) {
          ElMessage.success('删除任务成功')
          fetchScanTasks()
        } else {
          ElMessage.error('删除任务失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除任务失败')
        }
      }
    }

    onMounted(() => {
      fetchScanTasks()
    })

    return {
      scanTasks,
      detailsVisible,
      currentTask,
      getStatusType,
      getStatusText,
      getSeverityType,
      viewDetails,
      deleteTask
    }
  }
}
</script>

<style scoped>
.scan-task-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vulnerabilities-section {
  margin-top: 20px;
}

.vulnerabilities-section h3 {
  margin-bottom: 15px;
}
</style> 