<template>
  <div class="analyse-container">
    <h2 class="page-title">{{ activeTab === 'accountRate' ? '开户率分析' : '跟进率分析' }}</h2>
    
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="开户率分析" name="accountRate"></el-tab-pane>
      <el-tab-pane label="跟进率分析" name="followUpRate"></el-tab-pane>
    </el-tabs>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 第一块图表：区域分公司维度 -->
      <region-branch-chart :active-tab="activeTab" />

      <!-- 第二块图表：一级分支维度 -->
      <branch-dimension-chart :active-tab="activeTab" />

      <!-- 第三块图表：跟进人维度 -->
      <third-chart :active-tab="activeTab" />
    </div>
  </div>
</template>

<script>
import RegionBranchChart from '@/components/charts/RegionBranchChart.vue'
import BranchDimensionChart from '@/components/charts/BranchDimensionChart.vue'
import ThirdChart from '@/components/charts/ThirdChart.vue'

export default {
  name: 'Analyse',
  components: {
    RegionBranchChart,
    BranchDimensionChart,
    ThirdChart
  },
  data() {
    return {
      activeTab: 'accountRate'
    }
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab.name
    }
  }
}
</script>

<style scoped>
.analyse-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px;
  min-height: calc(100vh - 40px);
}

.page-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.charts-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 5px;
}

.charts-container::-webkit-scrollbar {
  width: 8px;
}

.charts-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.charts-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.charts-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 全局控制表单元素样式 */
.charts-container .el-input__inner,
.charts-container .el-select .el-input__inner,
.charts-container .el-date-editor .el-input__inner {
  height: 28px !important;
  line-height: 28px !important;
  font-size: 12px;
}

.charts-container .el-input__icon {
  line-height: 28px !important;
}

.charts-container .el-select .el-input__icon {
  height: 28px !important;
}

.charts-container .el-select {
  line-height: 28px !important;
}

.charts-container .el-tag {
  height: 22px;
  line-height: 20px;
  font-size: 12px;
}

.charts-container .custom-multi-select {
  width: 160px;
}

.charts-container .custom-multi-select .select-trigger {
  min-height: 28px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.charts-container .custom-multi-select .arrow-icon,
.charts-container .custom-multi-select .clear-icon {
  line-height: 28px;
}
</style>
