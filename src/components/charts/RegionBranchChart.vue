<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">区域分公司（包含独立分支）维度</h3>
      <div class="chart-controls">
        <date-range-picker
          v-model="dateRange"
          :stat-dimension="statDimension"
          @change="queryData"
        />
        <el-select v-model="statDimension" placeholder="统计维度" @change="queryData">
          <el-option label="月维度" value="month"></el-option>
          <el-option label="日维度" value="day"></el-option>
        </el-select>
      </div>
    </div>
    <line-chart
      v-loading="chartLoading"
      :x-axis-data="xAxisData"
      :series="seriesData"
      :color-start-index="0"
    />
  </div>
</template>

<script>
import LineChart, { colorConfig ,getRandomColor} from './LineChart.vue'
import DateRangePicker from './DateRangePicker.vue'
export default {
  name: 'RegionBranchChart',
  components: {
    LineChart,
    DateRangePicker,
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
      seriesData: [],
      chartLoading: false
    }
  },
  computed: {
    xAxisData() {
      const data = []
      if (this.statDimension === 'day') {
        const end = new Date()
        const start = new Date(end)
        start.setMonth(end.getMonth() - 11)
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        
        const current = new Date(start)
        while (current <= end) {
          data.push(this.formatDate(current, 'MM-dd'))
          current.setDate(current.getDate() + 1)
        }
      } else {
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          data.push(this.formatDate(date, 'yyyy-MM'))
        }
      }
      return data
    }
  },
  watch: {
    statDimension(val) {
      if (val === 'day') {
        this.dateRange = []
      }
      // this.fetchSeriesData()
    },
    activeTab() {
      this.queryData()
    }
  },
  mounted(){
    this.fetchSeriesData()
  },
  methods: {
    async fetchSeriesData() {
      this.chartLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const dataLength = this.xAxisData.length//this.statDimension === 'day' ? 31 : 12

        // 全公司数据
        const allCompanyData = []
        for (let i = 0; i < dataLength; i++) {
          allCompanyData.push((Math.random() * 20 + 60).toFixed(2))
        }

        // 9个公司的数据
        const companyNames = ['公司1', '公司2', '公司3', '公司4', '公司5', '公司6', '公司7', '公司8', '公司9', '公司99', '公司90']
        const companySeries = companyNames.map((name, index) => {
          const data = []
          for (let i = 0; i < dataLength; i++) {
            data.push((Math.random() * 3000 + 40 + index * 5).toFixed(2))
          }
          return {
            name,
            data,
            color: colorConfig[index + 1]?colorConfig[index + 1]: getRandomColor(colorConfig)  ,// getRandomColor
            smooth: true
          }
        })

        this.seriesData = [
          { name: '全公司', data: allCompanyData, color: colorConfig[0], smooth: true },
          ...companySeries
        ]
      } catch (error) {
        console.error('获取图表数据失败:', error)
      } finally {
        this.chartLoading = false
      }
    },
    queryData(){
      this.$nextTick(()=>{
        console.log('queryData ================================', this.dateRange, this.statDimension, this.seriesData)
     
        this.fetchSeriesData()
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

<style   scoped>
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
}

.chart-controls .el-select {
  width: 120px;
}
</style>
