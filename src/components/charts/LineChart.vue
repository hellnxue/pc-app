<template>
  <div ref="chart" class="line-chart"></div>
</template>

<script>
import * as echarts from 'echarts'
import {debounce} from 'lodash'
export const colorConfig = ['#D20A10','#C6A560','#5D7092','#F6BD16','#5B8FF9','#6DC8EC','#9270CA','#70CAB9','#F798A7']
export const getRandomColor = (list) => {
    let color;
    do {
        color = '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
    } while (list.includes(color.toUpperCase()));
    return color;
};
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
      chart: null
    }
  },
  watch: {
    xAxisData() {
      this.updateChart()
    },
    series() {
      this.updateChart()
    }
  },
  mounted() {
    this.initChart()
    this.fn=debounce(this.handleResize,100)
    window.addEventListener('resize', this.fn)//防抖
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.fn)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chart) return
      this.chart = echarts.init(this.$refs.chart)
      this.updateChart()
    },

    upadteGridLeft(){

      let maxCharlength=4;

      const calucatedLeft=maxCharlength*12+8

      this.$nextTick(()=>{

        this.chart.setOption({
          grid:{
            left:calucatedLeft
          }
        })

        // let gridOption=JSON.stringify(this.chart.getOption().grid,null,2)

        // console.log(gridOption)

      })



      },

    updateChart() {
      if (!this.chart) return
      
      const legendData = this.series.map(s => s.name)
      const seriesData = this.series.map((s, index) => {
        const defaultColor = s.color || colorConfig[(this.colorStartIndex + index) % colorConfig.length]
        const item = {
          name: s.name,
          type: 'line',
          // smooth: s.smooth !== false,
          data: s.data,
          showSymbol: false,
          itemStyle: {
            color: defaultColor
          }
        }
        
        if (this.showArea) {
          item.areaStyle = {
            color: {
              colorStops: [
                { offset: 0, color: this.hexToRgba(defaultColor, 0.10) },
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
        
        return item
      })
      
      const option = {
        grid: {
          left: '3.2%',
          right: '2.1%',
          top: '11%',
          bottom: '18%'
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
            z: -101,
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'rgba(53, 142, 254, .5)'
            }
          },
          formatter(params) {
            if (!params || !params.length) return ''
            const date = params[0].axisValue
            const headerHtml = `<div style="font-size: 12px; color: #999;text-align:left;">${date}</div>`
            const contentHtml = params.map(item => {
              const color = item.color || '#333'
              const value = parseFloat(item.value).toFixed(2)
              return ` <div style="display: flex; justify-content: space-between; margin-bottom:4px;">
                <span style="color: ${color};">${item.seriesName}</span>
                <span style="color: #333;">${value}%</span>
              </div>`
            }).join('')
            return `<div style="padding: 5px 0 10px 10px;display:flex;flex-direction:column;">${headerHtml}<div style='max-height:182px;overflow-y: auto;padding-right:10px;'>${contentHtml}</div></div>`
          }
        },
        legend: {
          // top: 8,
          // right: 102,
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 20,
          icon:'rect',
          // icon: 'path://M2,0 h12 a2,2 0 0 1 2,2 v8 a2,2 0 0 1 -2,2 h-12 a2,2 0 0 1 -2,-2 v-8 a2,2 0 0 1 2,-2 z',
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
            interval: 0
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
      this.upadteGridLeft()
    },
    /**
 * 获取默认颜色
 * @param {number} index - 颜色索引
 * @returns {string} 返回对应的颜色值，当索引超出颜色数组长度时循环使用
 */
getDefaultColor(index) {
      const colors = ['#358EFE', '#4CCBC2', '#FF9F43', '#EE5A5A', '#909399', '#8e71d9', '#e6c075', '#5cb6ff']
      return colors[index % colors.length]
    },
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    handleResize() {
      console.log('test======================');
      
      if (this.chart) {
        this.chart.resize()
      this.upadteGridLeft()

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
}
</style>
