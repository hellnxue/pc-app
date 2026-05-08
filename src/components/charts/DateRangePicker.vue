<template>
  <el-date-picker
    :value="value"
    @input="handleInput($event)"
    :type="localStatDimension === 'day' ? 'daterange' : 'monthrange'"
    range-separator="至"
    :start-placeholder="localStatDimension === 'day' ? '开始日期' : '开始月份'"
    :end-placeholder="localStatDimension === 'day' ? '结束日期' : '结束月份'"
    :format="localStatDimension === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM'"
    :value-format="localStatDimension === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM'"
    placeholder="选择时间范围"
  />
</template>

<script>
export default {
  name: 'DateRangePicker',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    statDimension: {
      type: String,
      default: 'month'
    }
  },
  data() {
    return {
      localStatDimension: 'month'
    }
  },
  watch: {
    statDimension: {
      immediate: true,
      handler(val) {
        this.localStatDimension = val
        this.initDateRange()
      }
    }
  },
  mounted() {
    // this.initDateRange()
  },
  methods: {
    handleInput($event){
      this.$emit('input', $event)
      this.$emit('change')
    },
    initDateRange() {
      const end = new Date()
      const start = new Date()
      
      if (this.localStatDimension === 'day') {
        // 日维度：近一个月
        // start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000)
        // 日维度：从今天倒推12个月，取去年那月的1号
        start.setMonth(end.getMonth() - 11)  // 倒推11个月，保证共12个月
        start.setDate(1)                      // 设为该月1号 
        
      } else {
        // 月维度：近一年
        // start.setFullYear(start.getFullYear() - 1)
        // start.setMonth(end.getMonth() - 12)

      // 月维度：最近12个月（包含当前月）
        start.setFullYear(end.getFullYear(), end.getMonth() - 11, 1)
        // 月份从 end 往前推 11 个月，即共 12 个月     
    }
      
      this.$emit('input', [this.formatDate(start), this.formatDate(end)])
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      if (this.localStatDimension === 'day') {
        return `${year}-${month}-${day}`
      }
      return `${year}-${month}`
    }
  }
}
</script>
