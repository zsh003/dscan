<template>
  <div class="target-list">
    <div class="page-header">
      <h1>扫描目标</h1>
      <el-button type="primary" @click="dialogVisible = true">
        添加目标
      </el-button>
    </div>

    <el-table :data="targets" style="width: 100%">
      <el-table-column prop="url" label="URL" width="300" />
      <el-table-column prop="ip" label="IP地址" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="createScanTask(scope.row)">
            开始扫描
          </el-button>
          <el-button type="danger" size="small" @click="deleteTarget(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加目标对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加扫描目标"
      width="500px"
    >
      <el-form :model="newTarget" label-width="100px">
        <el-form-item label="URL">
          <el-input v-model="newTarget.url" placeholder="请输入目标URL" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="newTarget.ip" placeholder="请输入IP地址（可选）" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newTarget.description"
            type="textarea"
            placeholder="请输入目标描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addTarget">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建扫描任务对话框 -->
    <el-dialog
      v-model="scanDialogVisible"
      title="创建扫描任务"
      width="500px"
    >
      <el-form :model="newTask" label-width="100px">
        <el-form-item label="扫描类型">
          <el-select v-model="newTask.scan_type" placeholder="请选择扫描类型">
            <el-option label="端口扫描" value="port" />
            <el-option label="操作系统扫描" value="os" />
            <el-option label="SQL注入扫描" value="sql" />
            <el-option label="XSS扫描" value="xss" />
            <el-option label="目录扫描" value="dir" />
            <el-option label="信息泄露扫描" value="info" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scanDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="startScan">开始扫描</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'TargetList',
  setup() {
    const store = useStore()
    const targets = ref([])
    const dialogVisible = ref(false)
    const scanDialogVisible = ref(false)
    const newTarget = ref({
      url: '',
      ip: '',
      description: ''
    })
    const newTask = ref({
      target: null,
      scan_type: ''
    })

    const fetchTargets = async () => {
      await store.dispatch('fetchTargets')
      targets.value = store.state.targets
    }

    const addTarget = async () => {
      try {
        await store.dispatch('createTarget', newTarget.value)
        ElMessage.success('添加目标成功')
        dialogVisible.value = false
        newTarget.value = { url: '', ip: '', description: '' }
        await fetchTargets()
      } catch (error) {
        ElMessage.error('添加目标失败')
      }
    }

    const createScanTask = (target) => {
      newTask.value.target = target.id
      scanDialogVisible.value = true
    }

    const startScan = async () => {
      try {
        await store.dispatch('createScanTask', newTask.value)
        ElMessage.success('扫描任务已创建')
        scanDialogVisible.value = false
        newTask.value = { target: null, scan_type: '' }
      } catch (error) {
        ElMessage.error('创建扫描任务失败')
      }
    }

    const deleteTarget = async (target) => {
      try {
        await store.dispatch('deleteTarget', target.id)
        ElMessage.success('删除目标成功')
        await fetchTargets()
      } catch (error) {
        ElMessage.error('删除目标失败')
      }
    }

    onMounted(fetchTargets)

    return {
      targets,
      dialogVisible,
      scanDialogVisible,
      newTarget,
      newTask,
      addTarget,
      createScanTask,
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 