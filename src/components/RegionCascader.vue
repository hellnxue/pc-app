<template>
  <div class="region-cascader" :class="[isInlineForm ? 'inline-form' : 'block-form']">
    <el-form-item label="省份">
      <el-select 
        v-model="provinceSelect" 
        placeholder="请选择" 
        clearable 
        :multiple="multiple"
        :collapse-tags="multiple"
        @change="onProvinceChange"
      >
        <el-option 
          v-for="prov in provinceCityList" 
          :key="prov.label" 
          :label="prov.label" 
          :value="prov.label" 
        />
      </el-select>
    </el-form-item>
    <el-form-item label="城市">
      <el-select 
        v-model="citySelect" 
        placeholder="请选择" 
        clearable 
        :multiple="multiple"
        :collapse-tags="multiple"
        :disabled="!internal.province.length" 
        @change="onCityChange"
      >
        <el-option 
          v-for="city in cityOptions" 
          :key="city.value" 
          :label="city.label" 
          :value="city.value" 
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="isShowDistrict" label="区县">
      <el-select 
        v-model="districtSelect" 
        placeholder="请选择" 
        clearable 
        :multiple="multiple"
        :collapse-tags="multiple"
        :disabled="!internal.city.length" 
        @change="emitChange"
      >
        <el-option 
          v-for="area in areaOptions" 
          :key="area.value" 
          :label="area.label" 
          :value="area.value" 
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'RegionCascader',
  props: {
    value: {
      type: Object,
      default: () => ({ province: [], city: [], district: [] })
    },
    // 是否多选，false 时为单选（但值仍以数组格式返回）
    multiple: {
      type: Boolean,
      default: true
    },
    isShowDistrict: {
      type: Boolean,
      default: true
    },
    isInlineForm: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      internal: {
        province: Array.isArray(this.value?.province) ? [...this.value.province] : [],
        city: Array.isArray(this.value?.city) ? [...this.value.city] : [],
        district: Array.isArray(this.value?.district) ? [...this.value.district] : []
      },
      cityOptions: [],
      areaOptions: [],
      provinceCityList: [],
      provincesCitiesMap: {}
    }
  },
  computed: {
    // 以下三个 computed 将 el-select 的 v-model（单选→字符串，多选→数组）
    // 与组件内部的数组格式互相转换，确保 internal 始终为数组
    provinceSelect: {
      get() {
        return this.multiple ? this.internal.province : (this.internal.province[0] || '')
      },
      set(val) {
        this.internal.province = this.multiple
          ? (Array.isArray(val) ? val : [])
          : (val ? [val] : [])
      }
    },
    citySelect: {
      get() {
        return this.multiple ? this.internal.city : (this.internal.city[0] || '')
      },
      set(val) {
        this.internal.city = this.multiple
          ? (Array.isArray(val) ? val : [])
          : (val ? [val] : [])
      }
    },
    districtSelect: {
      get() {
        return this.multiple ? this.internal.district : (this.internal.district[0] || '')
      },
      set(val) {
        this.internal.district = this.multiple
          ? (Array.isArray(val) ? val : [])
          : (val ? [val] : [])
      }
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.internal.province = Array.isArray(val.province) ? [...val.province] : []
          this.internal.city = Array.isArray(val.city) ? [...val.city] : []
          this.internal.district = Array.isArray(val.district) ? [...val.district] : []
        }
      },
      deep: true
    }
  },
  async created() {
    // 模拟从接口获取省份城市区县数据
    await new Promise(resolve => setTimeout(resolve, 300))
    this.provinceCityList = [
      {
        label: '北京',
        cityList: [
          { 
            label: '北京市', value: '北京市',
            areaList: [
              { label: '东城区', value: '东城区' },
              { label: '西城区', value: '西城区' },
              { label: '朝阳区', value: '朝阳区' },
              { label: '丰台区', value: '丰台区' }
            ]
          }
        ]
      },
      {
        label: '上海',
        cityList: [
          { 
            label: '上海市', value: '上海市',
            areaList: [
              { label: '黄浦区', value: '黄浦区' },
              { label: '徐汇区', value: '徐汇区' },
              { label: '长宁区', value: '长宁区' },
              { label: '静安区', value: '静安区' }
            ]
          }
        ]
      },
      {
        label: '广州',
        cityList: [
          { 
            label: '广州市', value: '广州市',
            areaList: [
              { label: '天河区', value: '天河区' },
              { label: '越秀区', value: '越秀区' },
              { label: '黄埔区', value: '黄埔区' },
              { label: '海珠区', value: '海珠区' }
            ]
          }
        ]
      },
      {
        label: '深圳',
        cityList: [
          { 
            label: '深圳市', value: '深圳市',
            areaList: [
              { label: '南山区', value: '南山区' },
              { label: '福田区', value: '福田区' },
              { label: '宝安区', value: '宝安区' },
              { label: '罗湖区', value: '罗湖区' }
            ]
          }
        ]
      }
    ]
    // 从 provinceCityList 生成 provincesCitiesMap
    this.provincesCitiesMap = {}
    this.provinceCityList.forEach(province => {
      this.provincesCitiesMap[province.label] = province.cityList
    })
    // 如果外部传入了初始值，初始化城市和区县选项
    if (this.internal.province.length) {
      this.rebuildCityOptions()
      if (this.internal.city.length) {
        this.rebuildAreaOptions()
      }
    }
  },
  methods: {
    emitChange() {
      this.$emit('input', {
        province: [...this.internal.province],
        city: [...this.internal.city],
        district: [...this.internal.district]
      })
    },
    /** 根据当前已选的省份，重新构建城市选项（取并集去重） */
    rebuildCityOptions() {
      const all = []
      const seen = new Set()
      this.internal.province.forEach(p => {
        const cities = this.provincesCitiesMap[p]
        if (cities) {
          cities.forEach(city => {
            if (!seen.has(city.value)) {
              seen.add(city.value)
              all.push(city)
            }
          })
        }
      })
      this.cityOptions = all
    },
    /** 根据当前已选的城市（跨所有已选省份），重新构建区县选项（取并集去重） */
    rebuildAreaOptions() {
      const all = []
      const seen = new Set()
      // 遍历所有已选省份
      this.internal.province.forEach(p => {
        const cities = this.provincesCitiesMap[p]
        if (cities) {
          cities.forEach(cityItem => {
            // 只收集当前已选中的城市
            if (this.internal.city.includes(cityItem.value) && cityItem.areaList) {
              cityItem.areaList.forEach(area => {
                if (!seen.has(area.value)) {
                  seen.add(area.value)
                  all.push(area)
                }
              })
            }
          })
        }
      })
      this.areaOptions = all
    },
    onProvinceChange() {
      // 重建城市选项（多个省份的城市取并集）
      this.rebuildCityOptions()
      // 过滤掉不在新城市选项中的已选城市
      const validCityValues = new Set(this.cityOptions.map(c => c.value))
      const prevCityLen = this.internal.city.length
      this.internal.city = this.internal.city.filter(c => validCityValues.has(c))
      
      if (this.internal.city.length < prevCityLen) {
        // 有城市被移除，需要同步清理区县
        this.internal.district = []
        this.areaOptions = []
        if (this.internal.city.length) {
          this.rebuildAreaOptions()
          // 再过滤区县
          const validAreaValues = new Set(this.areaOptions.map(a => a.value))
          this.internal.district = this.internal.district.filter(d => validAreaValues.has(d))
        }
      }
      // 如果城市没变但省份变了，区县选项也可能需要更新（例如新增的省份也有相同城市名）
      if (this.internal.city.length) {
        this.rebuildAreaOptions()
        const validAreaValues = new Set(this.areaOptions.map(a => a.value))
        this.internal.district = this.internal.district.filter(d => validAreaValues.has(d))
      }
      this.emitChange()
    },
    onCityChange() {
      if (this.internal.city.length) {
        this.rebuildAreaOptions()
        // 过滤掉不在新区县选项中的已选区县
        const validAreaValues = new Set(this.areaOptions.map(a => a.value))
        this.internal.district = this.internal.district.filter(d => validAreaValues.has(d))
      } else {
        this.internal.district = []
        this.areaOptions = []
      }
      this.emitChange()
    }
  }
}
</script>

<style lang="scss" scoped>

.region-cascader{

  &.inline-form {
    display: inline-block;
  
  }
  &.block-form {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  &.block-form ::v-deep .el-form-item {
    flex: 1;
    min-width: 0;
    margin-right: 0;
  }
  &.block-form ::v-deep .el-select {
    width: 100%;
  }
}

</style>
