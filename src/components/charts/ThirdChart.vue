<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">跟进人维度</h3>
      <div class="chart-controls">
        <date-range-picker
          v-model="localDateRange"
          :stat-dimension="localStatDimension"
          @change="queryData"
        />
        <el-select v-model="localStatDimension" placeholder="统计维度" @change="queryData">
          <el-option label="月维度" value="month"></el-option>
          <el-option label="日维度" value="day"></el-option>
        </el-select>
        <multi-select-dropdown
          v-model="localSelectedLevel1"
          :options="level1Options"
          placeholder="一级分公司"
          :collapse-tags-limit="1"
          clearable
          @change="handleLevel1Change"
        />
        <multi-select-dropdown
          v-model="localSelectedLevel2"
          :options="level2Options"
          placeholder="二级分公司"
          :collapse-tags-limit="1"
          :disabled="!localSelectedLevel1.length"
          clearable
          @change="handleLevel2Change"
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
import MultiSelectDropdown from './multiSelectDropdown.vue'

export default {
  name: 'ThirdChart',
  components: {
    LineChart,
    DateRangePicker,
    MultiSelectDropdown
  },
  props: {
    activeTab: {
      type: String,
      default: 'accountRate'
    }
  },
  data() {
    return {
      localStatDimension: 'month',
      localDateRange: [],
      localSelectedLevel1: [],
      localSelectedLevel2: [],
      level1Options: [],
      level2Map: {},
      level2Options: []
    }
  },
  computed: {
    xAxisData() {
      const data = []
      if (this.localStatDimension === 'day') {
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
      const dataLength = this.localStatDimension === 'day' ? 31 : 12
      // 获取选中的二级分公司名称
      const selectedLevel2Labels = this.localSelectedLevel2.map(val => {
        const item = this.level2Options.find(opt => opt.value === val)
        return item ? item.label : val
      })
      
      return selectedLevel2Labels.map((company, index) => {
        const data = []
        for (let i = 0; i < dataLength; i++) {
          data.push((Math.random() * 30 + 40 + index * 8).toFixed(2))
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
  mounted() {
    this.fetchLevel1Options()
  },
  watch: {
    localStatDimension(val) {
      if (val === 'day') {
        this.localDateRange = []
      }
    },
    activeTab() {
      this.queryData()
    }
  },
  methods: {
    queryData() {
      this.$nextTick(() => {
        console.log('queryData =====3===========================', this.localDateRange, this.localStatDimension, this.localSelectedLevel2)
      })
    },
    // 模拟异步获取一级分公司数据
    async fetchLevel1Options() {
      await new Promise(resolve => setTimeout(resolve, 500))
      // 模拟接口返回数据，转换为 {label, value} 格式
      const mockData = ['广东分公司', '上海分公司', '北京分公司']
      this.level1Options = mockData.map(item => ({ label: item, value: item }))
      this.localSelectedLevel1 = mockData
      await this.fetchLevel2Options()
    },
    // 模拟异步获取二级分公司数据
    async fetchLevel2Options() {
      await new Promise(resolve => setTimeout(resolve, 300))
      // 模拟接口返回数据
      const mockMap = {
        '广东分公司': ['佛山分公司', '深圳分公司', '广州分公司'],
        '上海分公司': ['浦东分公司', '浦西分公司'],
        '北京分公司': ['朝阳分公司', '海淀分公司', '西城分公司']
      }
      this.level2Map = mockMap
      this.updateLevel2Options()
      const selectedValues = this.level2Options.map(opt => opt.value)
      this.localSelectedLevel2 = selectedValues
      this.queryData()
    },
    updateLevel2Options() {
      const options = []
      this.localSelectedLevel1.forEach(level1 => {
        if (this.level2Map[level1]) {
          this.level2Map[level1].forEach(item => {
            options.push({ label: item, value: item })
          })
        }
      })
      this.level2Options = options
    },
    formatDate(date, format) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return format === 'MM-dd' ? `${month}-${day}` : `${date.getFullYear()}-${month}`
    },
    handleLevel1Change(val) {
      this.localSelectedLevel1 = val
      this.updateLevel2Options()
      // 过滤出仍然有效的二级分公司
      const validValues = this.level2Options.map(opt => opt.value)
      const validLevel2 = this.localSelectedLevel2.filter(v => validValues.includes(v))
      this.localSelectedLevel2 = validLevel2
      this.queryData()
    },
    handleLevel2Change(val) {
      this.localSelectedLevel2 = val
      this.queryData()
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
  flex-wrap: wrap;
  gap: 10px;
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
