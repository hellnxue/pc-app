<template>
  <div style="position: relative; width: 100%; height: 100%;">
    <!-- 空数据占位区域 -->
    <div v-if="isEmptyData" class="empty-placeholder">
      <span>暂无数据</span>
    </div>
    
    <!-- 图表 -->
    <div v-show="!isEmptyData" ref="chart" class="line-chart" @click="onChartClick" @mousemove="onChartMouseMove" @mouseleave="onChartMouseLeave"></div>
    
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
    },
    yAxisName: {
      type: String,
      default: '开户率(%)'
    }
  },
  computed: {
    // 判断是否为空数据
    isEmptyData() {
      if (!this.series || this.series.length === 0) return true
      return this.series.every(s => !s.data || s.data.length === 0)
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
      resizeObserver: null,
      // 记录鼠标位置和当前索引（用于 legend 切换后刷新 tooltip）
      lastMouseX: 0,
      lastMouseY: 0,
      currentDataIndex: null,
      // 选中的 legend 数据
      selectedLegendData: []
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

    isPointInPlotArea(x, y) {
      if (!this.chart) return false
      if (typeof this.chart.containPixel === 'function') {
        try {
          return this.chart.containPixel({ gridIndex: 0 }, [x, y])
        } catch (err) {
          console.warn('containPixel error:', err)
        }
      }
      const grid = this.chart.getModel().getComponent('grid')?.[0]
      if (!grid) return false
      const rect = grid.getRect()
      return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
    },

    // 图表鼠标移动事件
    onChartMouseMove(e) {
      if (this.isLocked) return
      
      // 记录鼠标位置
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      
      const rect = this.$refs.chart.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (!this.isPointInPlotArea(x, y)) {
        this.showCustomTooltip = false
        return
      }
      
      try {
        const point = this.chart.convertFromPixel({ seriesIndex: 0 }, [x, y])
        if (point && point[0] !== undefined && point[0] !== null) {
          let dataIndex = Math.round(point[0])
          if (dataIndex < 0) dataIndex = 0
          if (dataIndex >= this.xAxisData.length) dataIndex = this.xAxisData.length - 1
          
          if (dataIndex >= 0 && dataIndex < this.xAxisData.length) {
            this.currentDataIndex = dataIndex
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
      
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      
      if (!this.isPointInPlotArea(x, y)) {
        if (!this.isLocked) {
          this.showCustomTooltip = false
        }
        return
      }
      
      try {
        const point = this.chart.convertFromPixel({ seriesIndex: 0 }, [x, y])
        if (point && point[0] !== undefined && point[0] !== null) {
          let dataIndex = Math.round(point[0])
          if (dataIndex < 0) dataIndex = 0
          if (dataIndex >= this.xAxisData.length) dataIndex = this.xAxisData.length - 1
          
          if (dataIndex >= 0 && dataIndex < this.xAxisData.length) {
            this.currentDataIndex = dataIndex
            
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

    // 获取当前可见的系列（根据 legend 选中状态）
    getVisibleSeries() {
      if (!this.chart) return this.series
      
      const option = this.chart.getOption()
      const legendSelected = option.legend?.[0]?.selected || {}
      
      // 如果没有 legend 选中状态，返回所有系列
      if (Object.keys(legendSelected).length === 0) {
        return this.series
      }
      
      // 过滤出可见的系列
      return this.series.filter(s => legendSelected[s.name] !== false)
    },

    // 在指定数据索引位置显示 tooltip
    showCustomTooltipAt(dataIndex, mouseX, mouseY) {
      // 获取当前可见的系列
      const visibleSeries = this.getVisibleSeries()
      
      // 收集所有可见系列在该索引的数据
      const tooltipData = []
      let hasValidData = false
      
      visibleSeries.forEach((s, idx) => {
        // 需要找到原始 series 中的真实索引，用于获取颜色
        const originalIndex = this.series.findIndex(orig => orig.name === s.name)
        if (s.data && s.data[dataIndex] !== undefined && s.data[dataIndex] !== null) {
          hasValidData = true
          const color = s.color || colorConfig[(this.colorStartIndex + (originalIndex !== -1 ? originalIndex : idx)) % colorConfig.length]
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
      
      if (!hasValidData || tooltipData.length === 0) {
        this.showCustomTooltip = false
        return
      }
      
      const date = this.xAxisData[dataIndex] || ''
      
      // 使用原来的 tooltip 样式构建 HTML 结构
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
      
      // 边界检测，防止 tooltip 超出屏幕
      this.$nextTick(() => {
        const tooltipEl = document.querySelector('.custom-tooltip')
        if (tooltipEl) {
          const rect = tooltipEl.getBoundingClientRect()
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          
          if (rect.right > windowWidth - 10) {
            this.customTooltipLeft = mouseX - rect.width - 15
          }
          if (this.customTooltipLeft < 10) {
            this.customTooltipLeft = 10
          }
          if (rect.bottom > windowHeight - 10) {
            this.customTooltipTop = mouseY - rect.height - 10
          }
          if (this.customTooltipTop < 10) {
            this.customTooltipTop = 10
          }
        }
      })
    },

    // 刷新 tooltip（legend 切换后调用）
    refreshTooltipAfterLegendChange() {
      if (this.showCustomTooltip && this.currentDataIndex !== null) {
        // 使用记录的位置重新生成 tooltip
        const mouseX = this.lastMouseX || (this.customTooltipLeft + 10)
        const mouseY = this.lastMouseY || (this.customTooltipTop + 10)
        this.showCustomTooltipAt(this.currentDataIndex, mouseX, mouseY)
      }
    },

    // 更新选中的 legend 数据
    updateSelectedLegendData() {
      if (!this.chart) return
      
      const option = this.chart.getOption()
      const selected = option.legend?.[0]?.selected || {}
      
      // 获取选中的 legend 对应的 series 数据
      this.selectedLegendData = this.series.filter(s => selected[s.name] !== false).map(s => (s.code))
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
      this.currentDataIndex = null
      
      const legendData = this.series.map(s => s.name)
      const seriesData = this.series.map((s, index) => {
        const defaultColor = s.color || colorConfig[(this.colorStartIndex + index) % colorConfig.length]
        // 如果只有一个数据点，强制显示 symbol
        const hasSinglePoint = s.data && s.data.length === 1        
        const seriesConfig = {
          name: s.name,
          type: 'line',
          data: s.data,
          showSymbol: hasSinglePoint,
          symbolSize: hasSinglePoint ? 8 : 4,
          lineStyle: {
            width: 2,
            color: defaultColor
          },
          itemStyle: {
            color: defaultColor
          },
          emphasis: {
            scale: hasSinglePoint ? 1.5 : false,
            focus: 'none'
          }
        }
        
        // 只有一个数据点时，让线条两端都显示圆点
        if (hasSinglePoint) {
          seriesConfig.lineStyle.width = 0 // 隐藏线条，只显示点
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
            show: true,
            z: -101,
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'rgba(153,153,153,.3)'
            }
          },
          formatter() {
            return ''
          }
        },
        legend: {
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 20,
          icon: 'roundRect',
          data: legendData,
          bottom: 0,
          type: 'scroll',
          orient: 'horizontal',
          pageIconColor: '#999',
          pageIconInactiveColor: '#ccc',
          pageIconSize: 12,
          textStyle: {
            color: '#666',
            fontSize: 11
          },
          pageTextStyle: {
            color: '#999',
            fontSize: 12
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
          name:this.yAxisName,
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
      
      // 初始化选中的 legend 数据
      this.updateSelectedLegendData()
      
      // 监听 legend 点击，动态更新 tooltip 内容
      this.chart.off('legendselectchanged')
      this.chart.on('legendselectchanged', (params) => {
        // 处理全公司逻辑（如果存在）
        if (legendData.length > 0 && legendData[0] === '全公司') {
          if (!params.selected['全公司']) {
            this.chart.dispatchAction({
              type: 'legendSelect',
              name: '全公司'
            })
            return
          }
        }
        // 更新选中的 legend 数据
        this.updateSelectedLegendData()
        // 刷新 tooltip 内容
        this.refreshTooltipAfterLegendChange()
      })
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

/* 空数据占位区域 */
.empty-placeholder {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  color: #999;
  font-size: 16px;
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