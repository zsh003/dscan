<template>
  <div class="scan-input">
    <a-card title="漏洞扫描" class="scan-card">
      <a-form :model="formState" @finish="onFinish">
        <a-form-item
          label="目标URL"
          name="url"
          :rules="[{ required: true, message: '请输入要扫描的URL' }]"
        >
          <a-input
            v-model:value="formState.url"
            placeholder="请输入要扫描的URL，例如: https://example.com"
          >
            <template #prefix>
              <link-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="扫描深度"
          name="depth"
        >
          <a-slider
            v-model:value="formState.depth"
            :marks="{
              1: '浅层',
              2: '中等',
              3: '深度'
            }"
            :min="1"
            :max="3"
          />
        </a-form-item>

        <a-form-item
          label="扫描模式"
          name="scanMode"
        >
          <a-checkbox-group v-model:value="formState.scanTypes">
            <a-checkbox value="sql">SQL注入</a-checkbox>
            <a-checkbox value="xss">XSS</a-checkbox>
            <a-checkbox value="command">命令注入</a-checkbox>
            <a-checkbox value="file">文件包含</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="scanning">
            开始扫描
          </a-button>
        </a-form-item>
      </a-form>

      <a-modal
        v-model:visible="scanningModalVisible"
        title="扫描进行中"
        :closable="false"
        :footer="null"
      >
        <div class="scanning-progress">
          <a-progress :percent="scanProgress" status="active" />
          <p>{{ currentScanStep }}</p>
        </div>
      </a-modal>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue';
import { LinkOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ScanInput',
  components: {
    LinkOutlined,
  },
  setup() {
    const router = useRouter();
    const formState = reactive({
      url: '',
      depth: 1,
      scanTypes: ['sql', 'xss']
    });

    const scanning = ref(false);
    const scanningModalVisible = ref(false);
    const scanProgress = ref(0);
    const currentScanStep = ref('准备开始扫描...');

    const simulateScan = async () => {
      const steps = [
        '正在分析目标URL...',
        '检查网站可访问性...',
        '扫描SQL注入漏洞...',
        '扫描XSS漏洞...',
        '扫描命令注入漏洞...',
        '生成扫描报告...'
      ];

      for (let i = 0; i < steps.length; i++) {
        currentScanStep.value = steps[i];
        scanProgress.value = Math.round((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      scanning.value = false;
      scanningModalVisible.value = false;
      router.push('/scan-result');
    };

    const onFinish = values => {
      scanning.value = true;
      scanningModalVisible.value = true;
      scanProgress.value = 0;
      
      // 这里应该调用后端API，现在用模拟数据演示
      simulateScan();
    };

    return {
      formState,
      scanning,
      scanningModalVisible,
      scanProgress,
      currentScanStep,
      onFinish,
    };
  },
});
</script>

<style scoped>
.scan-input {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.scan-card {
  margin-bottom: 24px;
}

.scanning-progress {
  text-align: center;
}

.scanning-progress p {
  margin-top: 16px;
  color: rgba(0, 0, 0, 0.45);
}
</style> 