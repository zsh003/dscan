<template>
  <el-container class="app-container">
    <el-aside width="200px">
      <el-menu
        :router="true"
        class="el-menu-vertical"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="/targets">
          <el-icon><aim /></el-icon>
          <span>扫描目标</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><list /></el-icon>
          <span>扫描任务</span>
        </el-menu-item>
        <el-menu-item index="/vulnerabilities">
          <el-icon><warning /></el-icon>
          <span>漏洞列表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <h2>DScan 漏洞扫描系统</h2>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { Aim, List, Warning } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Aim,
    List,
    Warning
  }
}
</script>

<style>
.app-container {
  height: 100vh;
}

.el-aside {
  background-color: #545c64;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #ddd;
}

.el-menu-vertical {
  border-right: none;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style> 