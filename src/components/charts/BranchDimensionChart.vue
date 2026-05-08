<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">一级分支维度</h3>
      <div class="chart-controls">
        <date-range-picker
          v-model="dateRange"
          :stat-dimension="statDimension"
          @change="queryData"

        />
        <el-select v-model="statDimension" placeholder="统计维度"  @change="queryData">
          <el-option label="月维度" value="month"></el-option>
          <el-option label="日维度" value="day"></el-option>
        </el-select>
        <!-- <el-select
          v-model="selectedCompanies"
          multiple
          placeholder="一级分公司"
          collapse-tags
          :loading="companyLoading"
           @change="queryData"
        >
          <el-option
            v-for="company in companyOptions"
            :key="company"
            :label="company"
            :value="company"
          />
        </el-select> -->

        <multi-select-dropdown
          v-model="selectedCompanies"
          :options="companyOptions"
          placeholder="请选择"
          clearable
          @change="queryData"
        />
      </div>
    </div>
    <line-chart
      :x-axis-data="xAxisData"
      :series="seriesData"
      :color-start-index="0"
    />
  </div>
</template>

<script>
import LineChart, { colorConfig } from './LineChart.vue'
import DateRangePicker from './DateRangePicker.vue'
import multiSelectDropdown   from './multiSelectDropdown.vue';

export default {
  name: 'BranchDimensionChart',
  components: {
    LineChart,
    DateRangePicker,
    multiSelectDropdown
  },
  props: {
    activeTab: {
      type: String,
      default: 'accountRate'
    }
  },
  data() {
    return {
      statDimension: 'month',
      dateRange: [],
      selectedCompanies: [],
      companyOptions: [],
      companyLoading: false
    }
  },
  computed: {
    xAxisData() {
      const data = []
      if (this.statDimension === 'day') {
        for (let i = 30; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          data.push(this.formatDate(date, 'MM-dd'))
        }
      } else {
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          data.push(this.formatDate(date, 'yyyy-MM'))
        }
      }
      return data
    },
    seriesData() {
      const dataLength = this.statDimension === 'day' ? 31 : 12

      const selectedLabels = this.selectedCompanies.map(val => {
        const item = this.companyOptions.find(opt => opt.value === val)
        return item ? item.label : val
      })
      
      return selectedLabels.map((company, index) => {
        const data = []
        for (let i = 0; i < dataLength; i++) {
          data.push((Math.random() * 20 + 50 + index * 10).toFixed(2))
        }
        return {
          name: company,
          data: data,
          color: colorConfig[index],
          smooth: true
        }
      })
    }
  },
  async mounted() {
    this.fetchCompanyOptions()
    await this.queryData()
  },
  watch: {
    statDimension(val) {
      if (val === 'day') {
        this.dateRange = []
      }
    },
    activeTab() {
      this.queryData()
    }
  },
  methods: {
    async fetchCompanyOptions() {
      this.companyLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // 模拟接口返回数据
        const mockData = [
          { value: 'guangdong', label: '广东分公司' },
          { value: 'shanghai', label: '上海分公司' },
          { value: 'beijing', label: '北京分公司' },
        ]
        this.companyOptions = mockData
        this.selectedCompanies = ['guangdong']
      } catch (error) {
        console.error('获取公司列表失败:', error)
      } finally {
        this.companyLoading = false
      }
    },
    queryData(){
      this.$nextTick(()=>{
      console.log('queryData ================================bd',this.dateRange,this.statDimension);
      })
    },
    formatDate(date, format) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return format === 'MM-dd' ? `${month}-${day}` : `${date.getFullYear()}-${month}`
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.chart-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart-controls .el-select {
  width: 150px;
}
</style>
