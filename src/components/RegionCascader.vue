<template>
  <div class="region-cascader" :class="[isInlineForm ? 'inline-form' : 'block-form']">
    <el-form-item v-if="visibles.province" label="省份">
      <el-select
        v-model="provinceSelect"
        placeholder="请选择"
        clearable
        filterable
        remote
        :remote-method="remoteSearchProvince"
        :loading="provLoading"
        :multiple="multiple"
        :collapse-tags="multiple"
        @change="onProvinceChange"
      >
        <el-option
          v-for="prov in provinceOptions"
          :key="prov.value"
          :label="prov.label"
          :value="prov.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="visibles.city" label="城市">
      <el-select
        v-model="citySelect"
        placeholder="请选择"
        clearable
        filterable
        remote
        :remote-method="remoteSearchCity"
        :loading="cityLoading"
        :multiple="multiple"
        :collapse-tags="multiple"
        :disabled="!internal.province.length"
        @change="emitChange"
      >
        <el-option
          v-for="city in cityOptions"
          :key="city.value"
          :label="city.label"
          :value="city.value"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
// ==================== Mock 数据 ====================
// 全量省份列表
const MOCK_PROVINCES = [
  { id: '110000', name: '北京市' },
  { id: '120000', name: '天津市' },
  { id: '130000', name: '河北省' },
  { id: '310000', name: '上海市' },
  { id: '320000', name: '江苏省' },
  { id: '330000', name: '浙江省' },
  { id: '350000', name: '福建省' },
  { id: '370000', name: '山东省' },
  { id: '440000', name: '广东省' },
  { id: '500000', name: '重庆市' },
  { id: '510000', name: '四川省' }
]

// 全量城市列表（id 前 4 位与所属省份 id 前 4 位一致）
const MOCK_CITIES = [
  { id: '110000', name: '北京市' },
  { id: '120000', name: '天津市' },
  { id: '130100', name: '石家庄市' },
  { id: '130200', name: '唐山市' },
  { id: '130300', name: '秦皇岛市' },
  { id: '130400', name: '邯郸市' },
  { id: '310000', name: '上海市' },
  { id: '320100', name: '南京市' },
  { id: '320200', name: '无锡市' },
  { id: '320500', name: '苏州市' },
  { id: '330100', name: '杭州市' },
  { id: '330200', name: '宁波市' },
  { id: '330300', name: '温州市' },
  { id: '350100', name: '福州市' },
  { id: '350200', name: '厦门市' },
  { id: '370100', name: '济南市' },
  { id: '370200', name: '青岛市' },
  { id: '440100', name: '广州市' },
  { id: '440300', name: '深圳市' },
  { id: '440400', name: '珠海市' },
  { id: '440600', name: '佛山市' },
  { id: '500000', name: '重庆市' },
  { id: '510100', name: '成都市' },
  { id: '510700', name: '绵阳市' }
]

// ==================== 模拟 API ====================
async function mockFetchProvinces(selStr) {
  await new Promise(resolve => setTimeout(resolve, 300))
  if (!selStr) return MOCK_PROVINCES.map(p => ({ label: p.name, value: p.id }))
  const kw = selStr.toLowerCase()
  return MOCK_PROVINCES
    .filter(p => p.name.toLowerCase().includes(kw) || p.id.includes(kw))
    .map(p => ({ label: p.name, value: p.id }))
}

async function mockFetchCities(selStr, provList) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const provPrefixes = new Set(provList.map(id => id.substring(0, 2)))
  let list = MOCK_CITIES.filter(c => provPrefixes.has(c.id.substring(0, 2)))
  if (selStr) {
    const kw = selStr.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(kw) || c.id.includes(kw))
  }
  return list.map(c => ({ label: c.name, value: c.id }))
}

// ==================== 组件 ====================
export default {
  name: 'RegionCascader',
  props: {
    value: {
      type: Object,
      default: () => ({ province: [], city: [], district: [] })
    },
    multiple: {
      type: Boolean,
      default: true
    },
    // @deprecated 不再有区县级联，保留 prop 兼容但不生效
    isShowDistrict: {
      type: Boolean,
      default: false
    },
    isInlineForm: {
      type: Boolean,
      default: true
    },
    visibleSelects: {
      type: Array,
      default: () => ['province', 'city'],
      validator: v => v.every(s => ['province', 'city', 'district'].includes(s))
    }
  },
  data() {
    return {
      internal: {
        province: Array.isArray(this.value?.province) ? [...this.value.province] : [],
        city: Array.isArray(this.value?.city) ? [...this.value.city] : []
      },
      // 全量省份缓存 [{label,value},...]
      allProvinceCache: [],
      // 各已选省份下获取到的城市缓存 { provinceId: [{label,value},...] }
      cachedCitiesMap: {},

      // 当前下拉选项（受搜索影响）
      provinceOptions: [],
      cityOptions: [],

      // 加载状态
      provLoading: false,
      cityLoading: false
    }
  },
  computed: {
    visibles() {
      return {
        province: this.visibleSelects.includes('province'),
        city: this.visibleSelects.includes('city'),
        // district 不再显示
        district: false
      }
    },
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
    }
  },
  watch: {
    value: {
      handler(val) {
        if (!val) return
        const prevProvince = [...this.internal.province].join(',')
        const prevCity = [...this.internal.city].join(',')

        this.internal.province = Array.isArray(val.province) ? [...val.province] : []
        this.internal.city = Array.isArray(val.city) ? [...val.city] : []

        const provinceChanged = prevProvince !== [...this.internal.province].join(',')
        const cityChanged = prevCity !== [...this.internal.city].join(',')
        if (!provinceChanged && !cityChanged) return

        this.$nextTick(async () => {
          if (provinceChanged) {
            this.ensureSelectedInProvinceOptions()
            if (this.visibles.city) {
              await this.fetchCitiesForProvince()
            }
          }
          // city 由外部变更 → 确保已选城市出现在选项中
          if (cityChanged && this.visibles.city) {
            this.ensureSelectedInCityOptions()
          }
        })
      },
      deep: true
    }
  },
  async created() {
    await this.fetchAllProvinces()
    this.provinceOptions = [...this.allProvinceCache]

    if (this.internal.province.length && this.visibles.city) {
      await this.fetchCitiesForProvince()
    }
  },
  methods: {
    // ==================== 远程搜索方法 ====================

    /** 省份远程模糊搜索 → api?selStr=query */
    async remoteSearchProvince(query) {
      if (!query) {
        this.provinceOptions = [...this.allProvinceCache]
        return
      }
      this.provLoading = true
      try {
        const results = await mockFetchProvinces(query)
        this.provinceOptions = this.mergeWithSelected(results, this.internal.province)
      } finally {
        this.provLoading = false
      }
    },

    /** 城市远程模糊搜索 → api?selStr=query&provList=[已选省份id数组] */
    async remoteSearchCity(query) {
      if (!this.internal.province.length) return
      this.cityLoading = true
      try {
        const results = await mockFetchCities(query, this.internal.province)
        this.cityOptions = this.mergeWithSelected(results, this.internal.city)
      } finally {
        this.cityLoading = false
      }
    },

    // ==================== 数据获取 ====================

    /** 获取全量省份 */
    async fetchAllProvinces() {
      this.allProvinceCache = await mockFetchProvinces('')
    },

    /**
     * 为当前已选省份获取城市列表。
     * - 已缓存的省份不再重复请求
     * - 取消勾选的省份会从缓存中清除
     */
    async fetchCitiesForProvince() {
      const selected = new Set(this.internal.province)
      // 清除不再选中的省份缓存
      Object.keys(this.cachedCitiesMap).forEach(pid => {
        if (!selected.has(pid)) delete this.cachedCitiesMap[pid]
      })
      // 获取未缓存的省份的城市
      const missing = this.internal.province.filter(pid => !this.cachedCitiesMap[pid])
      debugger
      if (missing.length) {
        const results = await mockFetchCities('', missing)
        // 按省份前缀分组存入缓存
        missing.forEach(pid => {
          const prefix = pid.substring(0, 2)
          this.cachedCitiesMap[pid] = results.filter(c => c.value.startsWith(prefix))
        })
      }
      // 合并所有已选省份的城市（去重）
      this.rebuildCityOptions()
    },

    /** 将所有已选省份缓存的城市合并去重设为 cityOptions */
    rebuildCityOptions() {
      const seen = new Set()
      const all = []
      this.internal.province.forEach(pid => {
        const cities = this.cachedCitiesMap[pid] || []
        cities.forEach(c => {
          if (!seen.has(c.value)) {
            seen.add(c.value)
            all.push(c)
          }
        })
      })
      this.cityOptions = all
    },

    // ==================== 数据合并工具 ====================

    mergeWithSelected(results, selected) {
      const resultSet = new Set(results.map(r => r.value))
      const extra = []
      selected.forEach(v => {
        if (!resultSet.has(v)) {
          // 已选项不在结果中 → 从缓存查找完整 item
          const cached = this.findInCaches(v)
          if (cached) extra.push(cached)
        }
      })
      return [...results, ...extra]
    },

    /** 从 province/city 缓存中查找 value */
    findInCaches(value) {
      // 先从省份缓存查
      const prov = this.allProvinceCache.find(p => p.value === value)
      if (prov) return prov
      // 再从城市缓存查
      for (const pid of Object.keys(this.cachedCitiesMap)) {
        const city = this.cachedCitiesMap[pid].find(c => c.value === value)
        if (city) return city
      }
      return null
    },

    /** 确保已选省份出现在 provinceOptions 中 */
    ensureSelectedInProvinceOptions() {
      const currentSet = new Set(this.provinceOptions.map(p => p.value))
      const missing = this.internal.province.filter(p => !currentSet.has(p))
      if (missing.length) {
        const extra = missing.map(p => {
          const found = this.allProvinceCache.find(x => x.value === p)
          return found || { label: p, value: p }
        })
        this.provinceOptions = [...this.provinceOptions, ...extra]
      }
    },

    /** 确保已选城市出现在 cityOptions 中 */
    ensureSelectedInCityOptions() {
      const currentSet = new Set(this.cityOptions.map(c => c.value))
      const missing = this.internal.city.filter(c => !currentSet.has(c))
      if (missing.length) {
        const extra = missing.map(c => {
          const found = this.findInCaches(c)
          return found || { label: c, value: c }
        })
        this.cityOptions = [...this.cityOptions, ...extra]
      }
    },

    // ==================== 变更事件 ====================

    emitChange() {
      this.$emit('input', {
        province: [...this.internal.province],
        city: [...this.internal.city],
        district: []
      })
    },

    async onProvinceChange() {
      if (this.internal.province.length) {
        await this.fetchCitiesForProvince()
        // 过滤掉不在新城市选项中的已选城市
        const validSet = new Set(this.cityOptions.map(c => c.value))
        this.internal.city = this.internal.city.filter(c => validSet.has(c))
      } else {
        this.cachedCitiesMap = {}
        this.cityOptions = []
        this.internal.city = []
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
