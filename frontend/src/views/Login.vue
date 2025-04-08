<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>登录 DScan</h2>
      </template>
      
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
/* eslint-disable */
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = ref(false)
    const loginForm = ref({
      username: '',
      password: ''
    })

    const handleLogin = async () => {
      if (!loginForm.value.username || !loginForm.value.password) {
        ElMessage.warning('请输入用户名和密码')
        return
      }

      loading.value = true
      try {
        await store.dispatch('login', loginForm.value)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败：用户名或密码错误')
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-card :deep(.el-card__header) {
  text-align: center;
}
</style> 