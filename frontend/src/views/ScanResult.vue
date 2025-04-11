<template>
  <div class="scan-result">
    <a-card class="scan-summary">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-statistic title="扫描URL" :value="scanData.url" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="发现漏洞总数" :value="scanData.totalVulnerabilities" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="扫描时间" :value="scanData.scanDuration" suffix="秒" />
        </a-col>
      </a-row>
    </a-card>

    <div class="charts-container">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="漏洞类型分布">
            <div ref="vulnerabilityTypeChart" style="height: 300px"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="风险等级分布">
            <div ref="riskLevelChart" style="height: 300px"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-card title="漏洞详情列表" class="vulnerability-list">
      <a-table :columns="columns" :data-source="vulnerabilityList">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'risk'">
            <a-tag :color="getRiskColor(record.risk)">
              {{ record.risk }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import * as echarts from 'echarts';

export default defineComponent({
  name: 'ScanResult',
  setup() {
    // 模拟数据
    const scanData = ref({
      url: 'https://example.com',
      totalVulnerabilities: 12,
      scanDuration: 45
    });

    const vulnerabilityList = ref([
      {
        key: '1',
        type: 'SQL注入',
        risk: '高危',
        url: '/api/users',
        description: 'SQL注入漏洞可能导致数据库信息泄露'
      },
      {
        key: '2',
        type: 'XSS',
        risk: '中危',
        url: '/page/search',
        description: '反射型XSS漏洞可能导致用户信息被盗取'
      },
      // 更多模拟数据...
    ]);

    const columns = [
      {
        title: '漏洞类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '风险等级',
        dataIndex: 'risk',
        key: 'risk',
      },
      {
        title: '影响URL',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: '漏洞描述',
        dataIndex: 'description',
        key: 'description',
      }
    ];

    const getRiskColor = (risk) => {
      const colors = {
        '高危': 'red',
        '中危': 'orange',
        '低危': 'blue'
      };
      return colors[risk] || 'default';
    };

    onMounted(() => {
      // 初始化漏洞类型分布图表
      const typeChart = echarts.init(document.querySelector('.vulnerability-type-chart'));
      typeChart.setOption({
        title: { text: '漏洞类型分布' },
        tooltip: {},
        series: [{
          type: 'pie',
          data: [
            { value: 5, name: 'SQL注入' },
            { value: 3, name: 'XSS' },
            { value: 2, name: '命令注入' },
            { value: 2, name: '文件包含' }
          ]
        }]
      });

      // 初始化风险等级分布图表
      const riskChart = echarts.init(document.querySelector('.risk-level-chart'));
      riskChart.setOption({
        title: { text: '风险等级分布' },
        tooltip: {},
        series: [{
          type: 'pie',
          data: [
            { value: 4, name: '高危' },
            { value: 5, name: '中危' },
            { value: 3, name: '低危' }
          ]
        }]
      });
    });

    return {
      scanData,
      vulnerabilityList,
      columns,
      getRiskColor
    };
  }
});
</script>

<style scoped>
.scan-result {
  padding: 24px;
}

.scan-summary {
  margin-bottom: 24px;
}

.charts-container {
  margin-bottom: 24px;
}

.vulnerability-list {
  margin-bottom: 24px;
}
</style> 