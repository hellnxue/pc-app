<template>
  <div style="position: relative; width: 100%; height: 100%;">
    <div ref="chart" class="line-chart" @click="onChartClick" @mousemove="onChartMouseMove" @mouseleave="onChartMouseLeave"></div>
    
    <!-- 自定义 tooltip -->
    <div v-if="showCustomTooltip" 
         class="custom-tooltip"
         :style="{ left: customTooltipLeft + 'px', top: customTooltipTop + 'px' }"
         @mouseenter="onTooltipMouseEnter"
         @mouseleave="onTooltipMouseLeave"
         v-html="customTooltipHtml"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from 'lodash'

export const colorConfig = ['#D20A10', '#C6A560', '#5D7092', '#F6BD16', '#5B8FF9', '#6DC8EC', '#9270CA', '#70CAB9', '#F798A7']
export const getRandomColor = (list) => {
  let color
  do {
    color = '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0')
  } while (list.includes(color.toUpperCase()))
  return color
}
export default {
  name: 'LineChart',
  props: {
    xAxisData: {
      type: Array,
      default: () => []
    },
    series: {
      type: Array,
      default: () => []
    },
    yAxisFormatter: {
      type: String,
      default: '{value}'
    },
    showArea: {
      type: Boolean,
      default: false
    },
    areaColor: {
      type: String,
      default: '#358EFE'
    },
    colorStartIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      chart: null,
      // 锁定状态
      isLocked: false,
      lockedDataIndex: null,
      // 自定义 tooltip
      showCustomTooltip: false,
      customTooltipLeft: 0,
      customTooltipTop: 0,
      customTooltipHtml: '',
      // 事件处理
      fn: null,
      resizeObserver: null
    }
  },
  watch: {
    xAxisData: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    series: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    this.fn = debounce(this.handleResize, 100)
    window.addEventListener('resize', this.fn)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.fn)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chart) return
      this.chart = echarts.init(this.$refs.chart)
      this.updateChart()
      
      // 监听图表容器大小变化
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize()
      })
      this.resizeObserver.observe(this.$refs.chart)
    },

    // 图表鼠标移动事件
    onChartMouseMove(e) {
      if (this.isLocked) return
      
      const rect = this.$refs.chart.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      try {
        const point = this.chart.convertFromPixel({ seriesIndex: 0 }, [x, y])
        if (point && point[0] !== undefined && point[0] !== null) {
          let dataIndex = Math.round(point[0])
          if (dataIndex < 0) dataIndex = 0
          if (dataIndex >= this.xAxisData.length) dataIndex = this.xAxisData.length - 1
          
          if (dataIndex >= 0 && dataIndex < this.xAxisData.length) {
            // 显示自定义 tooltip
            this.showCustomTooltipAt(dataIndex, e.clientX, e.clientY)
          }
        }
      } catch (err) {
        console.warn('convertFromPixel error:', err)
      }
    },

    // 图表鼠标离开事件
    onChartMouseLeave() {
      if (!this.isLocked) {
        this.showCustomTooltip = false
      }
    },

    // 图表点击事件：固定 tooltip
    onChartClick(e) {
      const rect = this.$refs.chart.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      try {
        const point = this.chart.convertFromPixel({ seriesIndex: 0 }, [x, y])
        if (point && point[0] !== undefined && point[0] !== null) {
          let dataIndex = Math.round(point[0])
          if (dataIndex < 0) dataIndex = 0
          if (dataIndex >= this.xAxisData.length) dataIndex = this.xAxisData.length - 1
          
          if (dataIndex >= 0 && dataIndex < this.xAxisData.length) {
            // 切换锁定状态：如果点击的是同一个点且已锁定，则解锁；否则锁定新点
            if (this.isLocked && this.lockedDataIndex === dataIndex) {
              this.unlockTooltip()
            } else {
              this.isLocked = true
              this.lockedDataIndex = dataIndex
              this.showCustomTooltipAt(dataIndex, e.clientX, e.clientY)
            }
          }
        }
      } catch (err) {
        console.warn('convertFromPixel error:', err)
      }
    },

    // 鼠标进入自定义 tooltip
    onTooltipMouseEnter() {
      // 保持 tooltip 显示，不做任何操作
    },

    // 鼠标离开自定义 tooltip
    onTooltipMouseLeave() {
      this.unlockTooltip()
    },

    // 在指定数据索引位置显示 tooltip
    showCustomTooltipAt(dataIndex, mouseX, mouseY) {
      // 收集所有系列在该索引的数据
      const tooltipData = []
      let hasValidData = false
      
      this.series.forEach((s, idx) => {
        if (s.data && s.data[dataIndex] !== undefined && s.data[dataIndex] !== null) {
          hasValidData = true
          const color = s.color || colorConfig[(this.colorStartIndex + idx) % colorConfig.length]
          let value = s.data[dataIndex]
          if (typeof value === 'number') {
            value = value.toFixed(2)
          }
          tooltipData.push({
            name: s.name,
            value: value,
            color: color
          })
        }
      })
      
      if (!hasValidData || tooltipData.length === 0) return
      
      const date = this.xAxisData[dataIndex] || ''
      
      // 构建 HTML 结构
      const headerHtml = `<div style="font-size: 12px; color: #999; text-align: left;">${date}</div>`
      const contentHtml = tooltipData.map(item => {
        return `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: ${item.color};">${item.name}</span>
          <span style="color: #333;">${item.value}%</span>
        </div>`
      }).join('')
      
      this.customTooltipHtml = `<div style="padding: 5px 0 10px 10px; display: flex; flex-direction: column;">
        ${headerHtml}
        <div style="max-height: 182px; overflow-y: auto; padding-right: 10px;">
          ${contentHtml}
        </div>
      </div>`
      
      this.customTooltipLeft = mouseX + 15
      this.customTooltipTop = mouseY - 10
      this.showCustomTooltip = true
      
      // 边界检测，防止 tooltip 超出屏幕右侧
      this.$nextTick(() => {
        const tooltipEl = document.querySelector('.custom-tooltip')
        if (tooltipEl) {
          const rect = tooltipEl.getBoundingClientRect()
          const windowWidth = window.innerWidth
          if (rect.right > windowWidth - 10) {
            this.customTooltipLeft = mouseX - rect.width - 15
          }
          if (this.customTooltipLeft < 10) {
            this.customTooltipLeft = 10
          }
          if (rect.bottom > window.innerHeight - 10) {
            this.customTooltipTop = mouseY - rect.height - 10
          }
        }
      })
    },

    // 解锁 tooltip
    unlockTooltip() {
      this.isLocked = false
      this.lockedDataIndex = null
      this.showCustomTooltip = false
    },

    updateChart() {
      if (!this.chart) return
      
      // 重置锁定状态
      this.isLocked = false
      this.showCustomTooltip = false
      
      const legendData = this.series.map(s => s.name)
      const seriesData = this.series.map((s, index) => {
        const defaultColor = s.color || colorConfig[(this.colorStartIndex + index) % colorConfig.length]
        const seriesConfig = {
          name: s.name,
          type: 'line',
          data: s.data,
          showSymbol: false,
          // symbol: 'circle',
          // symbolSize: 6,
          lineStyle: {
            width: 2,
            color: defaultColor
          },
          itemStyle: {
            color: defaultColor
          },
          emphasis: {
            scale: false,
            focus: 'none'
          }
        }
        
        if (this.showArea) {
          seriesConfig.areaStyle = {
            opacity: 0.3,
            color: {
              colorStops: [
                { offset: 0, color: this.hexToRgba(defaultColor, 0.15) },
                { offset: 1, color: this.hexToRgba(defaultColor, 0) }
              ],
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              type: 'linear',
              global: false
            }
          }
        }
        
        return seriesConfig
      })
      
      const option = {
        grid: {
          left: '3.2%',
          right: '2.1%',
          top: '11%',
          bottom: '18%',
          containLabel: false
        },
        // 启用原生 tooltip 来显示 axisPointer
        tooltip: {
          trigger: 'axis',
          show: true,
          borderWidth: 0,
          confine: true,
          enterable: true,
          extraCssText: 'box-shadow: 0 0 6px 2px #00000014;',
          backgroundColor: '#fff',
          padding: 0,
          axisPointer: {
            type: 'line',
            show:true,
            z: -101,
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'gold'
            }
          },
          formatter() {
            return ''
          }
        },
        // tooltip: {
        //   trigger: 'axis',
        //   show: true,
        //   // 通过 formatter 返回空字符串来隐藏原生 tooltip 内容
        //   formatter: () => '',
        //   // axisPointer: {
        //   //   type: 'line',
        //   //   show: true,
        //   //   snap: true,
        //   //   lineStyle: {
        //   //     type: 'dashed',
        //   //     width: 1,
        //   //     color: '#D20A10'
        //   //   },
        //   //   label: {
        //   //     show: true,
        //   //     backgroundColor: '#D20A10',
        //   //     color: '#fff',
        //   //     padding: [2, 6, 2, 6],
        //   //     borderRadius: 4
        //   //   }
        //   // }
          
        //   borderWidth: 0,
        //   confine: true,
        //   enterable: true,
        //   extraCssText: 'box-shadow: 0 0 6px 2px #00000014;',
        //   backgroundColor: '#fff',
        //   padding: 0,
        //   axisPointer: {
        //     type: 'line',
        //     show:true,
        //     z: -101,
        //     lineStyle: {
        //       type: 'dashed',
        //       width: 1,
        //       color: 'gold'
        //     }
        //   },
        // },
        legend: {
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 20,
          icon: 'rect',
          data: legendData,
          bottom: 0,
          type: 'scroll',
          orient: 'horizontal',
          pageIconColor: '#999',
          pageIconInactiveColor: '#ccc',
          pageIconSize: 12,
          pageTextStyle: {
            color: '#999'
          },
          inactiveColor: '#999'
        },
        xAxis: {
          type: 'category',
          data: this.xAxisData,
          boundaryGap: false,
          axisTick: {
            alignWithLabel: true,
            show: false,
            interval: 1
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            show: true,
            color: '#666',
            fontSize: 12,
            interval: 'auto',
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '开户率(%)',
          nameTextStyle: {
            color: '#999',
            fontSize: 12,
            align: 'right',
            verticalAlign: 'bottom'
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            show: true,
            color: '#999',
            fontSize: 14,
            formatter: this.yAxisFormatter,
            align: 'right',
            margin: 16
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(238, 238, 238, .9)',
              type: 'dashed'
            }
          }
        },
        series: seriesData
      }
      
      this.chart.setOption(option, true)
      this.updateGridLeft()
      
      // 监听 legend 点击，第一个为全公司时不允许取消选中
      if (legendData.length > 0 && legendData[0] === '全公司') {
        this.chart.off('legendselectchanged')
        this.chart.on('legendselectchanged', (params) => {
          if (!params.selected['全公司']) {
            this.chart.dispatchAction({
              type: 'legendSelect',
              name: '全公司'
            })
          }
        })
      }
    },

    updateGridLeft() {
      let maxCharLength = 4
      const calculatedLeft = maxCharLength * 12 + 8
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.setOption({
            grid: {
              left: calculatedLeft
            }
          })
        }
      })
    },

    hexToRgba(hex, alpha) {
      if (!hex) return `rgba(0, 0, 0, ${alpha})`
      let r = 0, g = 0, b = 0
      if (hex.startsWith('#')) {
        r = parseInt(hex.slice(1, 3), 16)
        g = parseInt(hex.slice(3, 5), 16)
        b = parseInt(hex.slice(5, 7), 16)
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
        this.updateGridLeft()
      }
    }
  }
}
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
  cursor: crosshair;
}

/* 隐藏原生 tooltip 的弹框，只保留 axisPointer */
:deep(.echarts-tooltip) {
  display: none !important;
}

.custom-tooltip {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 6px 2px #00000014;
  z-index: 1000;
  pointer-events: auto;
  font-size: 12px;
  min-width: 160px;
  max-width: 260px;
  border: 1px solid #e8e8e8;
}
</style>