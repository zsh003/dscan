<template>
  <div class="target-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>扫描目标列表</span>
          <el-button type="primary" @click="showAddDialog">添加目标</el-button>
        </div>
      </template>
      
      <el-table :data="targets" style="width: 100%">
        <el-table-column prop="name" label="目标名称" />
        <el-table-column prop="url" label="URL" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="startScan(scope.row)">开始扫描</el-button>
            <el-button size="small" type="danger" @click="deleteTarget(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加目标对话框 -->
    <el-dialog v-model="dialogVisible" title="添加扫描目标" width="500px">
      <el-form :model="newTarget" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newTarget.name" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="newTarget.url" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newTarget.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addTarget">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../config/api'

export default {
  name: 'TargetList',
  setup() {
    const targets = ref([])
    const dialogVisible = ref(false)
    const newTarget = ref({
      name: '',
      url: '',
      description: ''
    })

    // 获取目标列表
    const fetchTargets = async () => {
      try {
        const response = await fetch(api.targets)
        targets.value = await response.json()
      } catch (error) {
        ElMessage.error('获取目标列表失败')
      }
    }

    // 显示添加对话框
    const showAddDialog = () => {
      dialogVisible.value = true
    }

    // 添加新目标
    const addTarget = async () => {
      try {
        const response = await fetch(api.targets, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTarget.value)
        })
        if (response.ok) {
          ElMessage.success('添加目标成功')
          dialogVisible.value = false
          fetchTargets()
        } else {
          ElMessage.error('添加目标失败')
        }
      } catch (error) {
        ElMessage.error('添加目标失败')
      }
    }

    // 开始扫描
    const startScan = async (target) => {
      try {
        const response = await fetch(api.scanTasks, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: target.id,
            name: `扫描任务 - ${target.name}`
          })
        })
        if (response.ok) {
          ElMessage.success('扫描任务已启动')
        } else {
          ElMessage.error('启动扫描任务失败')
        }
      } catch (error) {
        ElMessage.error('启动扫描任务失败')
      }
    }

    // 删除目标
    const deleteTarget = async (target) => {
      try {
        await ElMessageBox.confirm('确定要删除该目标吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`${api.targets}${target.id}/`, {
          method: 'DELETE'
        })
        if (response.ok) {
          ElMessage.success('删除目标成功')
          fetchTargets()
        } else {
          ElMessage.error('删除目标失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除目标失败')
        }
      }
    }

    onMounted(() => {
      fetchTargets()
    })

    return {
      targets,
      dialogVisible,
      newTarget,
      showAddDialog,
      addTarget,
      startScan,
      deleteTarget
    }
  }
}
</script>

<style scoped>
.target-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 