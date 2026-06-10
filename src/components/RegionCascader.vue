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
    <el-form-item v-if="visibles.district" label="区县">
      <el-select
        v-model="districtSelect"
        placeholder="请选择"
        clearable
        filterable
        remote
        :remote-method="remoteSearchDistrict"
        :loading="districtLoading"
        :multiple="multiple"
        :collapse-tags="multiple"
        :disabled="!internal.city.length"
        @change="emitChange"
      >
        <el-option
          v-for="d in districtOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
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

// 全量区县列表（id 前2位=省前缀，前4位匹配城市前缀）
const MOCK_DISTRICTS = [
  { id: '110101', name: '东城区' },
  { id: '110102', name: '西城区' },
  { id: '110105', name: '朝阳区' },
  { id: '110106', name: '丰台区' },
  { id: '120101', name: '和平区' },
  { id: '120102', name: '河东区' },
  { id: '120103', name: '河西区' },
  { id: '130102', name: '长安区' },
  { id: '130104', name: '桥西区' },
  { id: '130105', name: '新华区' },
  { id: '130202', name: '路南区' },
  { id: '130204', name: '路北区' },
  { id: '130302', name: '海港区' },
  { id: '130303', name: '山海关区' },
  { id: '130404', name: '丛台区' },
  { id: '130406', name: '复兴区' },
  { id: '310101', name: '黄浦区' },
  { id: '310104', name: '徐汇区' },
  { id: '310105', name: '长宁区' },
  { id: '310106', name: '静安区' },
  { id: '320102', name: '玄武区' },
  { id: '320104', name: '秦淮区' },
  { id: '320105', name: '建邺区' },
  { id: '320206', name: '锡山区' },
  { id: '320507', name: '姑苏区' },
  { id: '320508', name: '虎丘区' },
  { id: '330102', name: '上城区' },
  { id: '330105', name: '拱墅区' },
  { id: '330106', name: '西湖区' },
  { id: '330203', name: '海曙区' },
  { id: '330205', name: '江北区' },
  { id: '330302', name: '鹿城区' },
  { id: '330303', name: '龙湾区' },
  { id: '350102', name: '鼓楼区' },
  { id: '350103', name: '台江区' },
  { id: '350104', name: '仓山区' },
  { id: '350205', name: '思明区' },
  { id: '350206', name: '湖里区' },
  { id: '370102', name: '历下区' },
  { id: '370103', name: '市中区' },
  { id: '370202', name: '市南区' },
  { id: '370203', name: '市北区' },
  { id: '440103', name: '荔湾区' },
  { id: '440104', name: '越秀区' },
  { id: '440105', name: '海珠区' },
  { id: '440106', name: '天河区' },
  { id: '440303', name: '罗湖区' },
  { id: '440304', name: '福田区' },
  { id: '440305', name: '南山区' },
  { id: '440306', name: '宝安区' },
  { id: '440507', name: '香洲区' },
  { id: '440604', name: '禅城区' },
  { id: '440605', name: '南海区' },
  { id: '500101', name: '万州区' },
  { id: '500103', name: '渝中区' },
  { id: '500104', name: '沙坪坝区' },
  { id: '510104', name: '锦江区' },
  { id: '510105', name: '青羊区' },
  { id: '510106', name: '金牛区' },
  { id: '510107', name: '武侯区' },
  { id: '510703', name: '涪城区' },
  { id: '510704', name: '游仙区' }
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

async function mockFetchDistricts(selStr, provList, cityList) {
  await new Promise(resolve => setTimeout(resolve, 300))
  // 直辖市: 省份 id 如 110000 与区县 id 如 110101 前2位相同
  // 普通城市: 城市 id 如 440100 与区县 id 如 440103 前4位相同
  const provPrefixes = provList.map(id => id.substring(0, 2))
  const cityPrefixes = cityList.map(id => id.substring(0, 4))
  let list = MOCK_DISTRICTS.filter(d => {
    const d2 = d.id.substring(0, 2)
    const d4 = d.id.substring(0, 4)
    return provPrefixes.includes(d2) || cityPrefixes.includes(d4)
  })
  if (selStr) {
    const kw = selStr.toLowerCase()
    list = list.filter(d => d.name.toLowerCase().includes(kw) || d.id.includes(kw))
  }
  return list.map(d => ({ label: d.name, value: d.id }))
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
    isInlineForm: {
      type: Boolean,
      default: true
    },
    visibleSelects: {
      type: Array,
      default: () => ['province', 'city', 'district'],
      validator: v => v.every(s => ['province', 'city', 'district'].includes(s))
    }
  },
  data() {
    return {
      internal: {
        province: Array.isArray(this.value?.province) ? [...this.value.province] : [],
        city: Array.isArray(this.value?.city) ? [...this.value.city] : [],
        district: Array.isArray(this.value?.district) ? [...this.value.district] : []
      },
      // 全量省份缓存
      allProvinceCache: [],
      // 已选省份 → 城市缓存
      cachedCitiesMap: {},
      // 已选城市 → 区县缓存
      cachedDistrictsMap: {},

      // 当前下拉选项（受搜索影响）
      provinceOptions: [],
      cityOptions: [],
      districtOptions: [],

      // 加载状态
      provLoading: false,
      cityLoading: false,
      districtLoading: false
    }
  },
  computed: {
    visibles() {
      return {
        province: this.visibleSelects.includes('province'),
        city: this.visibleSelects.includes('city'),
        district: this.visibleSelects.includes('district')
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
        if (!val) return
        const prevProvince = [...this.internal.province].join(',')
        const prevCity = [...this.internal.city].join(',')
        const prevDistrict = [...this.internal.district].join(',')

        this.internal.province = Array.isArray(val.province) ? [...val.province] : []
        this.internal.city = Array.isArray(val.city) ? [...val.city] : []
        this.internal.district = Array.isArray(val.district) ? [...val.district] : []

        const provinceChanged = prevProvince !== [...this.internal.province].join(',')
        const cityChanged = prevCity !== [...this.internal.city].join(',')
        const districtChanged = prevDistrict !== [...this.internal.district].join(',')

        if (!provinceChanged && !cityChanged && !districtChanged) return

        this.$nextTick(async () => {
          if (provinceChanged) {
            this.ensureSelectedInProvinceOptions()
            if (this.visibles.city) {
              await this.fetchCitiesForProvince()
            }
          }
          if (cityChanged) {
            this.ensureSelectedInCityOptions()
            if (this.visibles.district) {
              await this.fetchDistrictsForCity()
            }
          }
          if (districtChanged && this.visibles.district) {
            this.ensureSelectedInDistrictOptions()
          }
        })
      },
      deep: true
    }
  },
  async created() {
    await this.fetchAllProvinces()
    this.provinceOptions = [...this.allProvinceCache]

    if (this.internal.province.length) {
      await this.fetchCitiesForProvince()
    }
    if (this.internal.city.length && this.visibles.district) {
      await this.fetchDistrictsForCity()
    }
  },
  methods: {
    // ==================== 远程搜索 ====================

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

    async remoteSearchCity(query) {
      if (!this.internal.province.length) return
      const pool = this.buildCityPool()
      if (!query) {
        this.cityOptions = this.mergeWithSelected(pool, this.internal.city)
        return
      }
      this.cityLoading = true
      try {
        const results = await mockFetchCities(query, this.internal.province)
        this.cityOptions = this.mergeWithSelected(results, this.internal.city)
      } finally {
        this.cityLoading = false
      }
    },

    async remoteSearchDistrict(query) {
      if (!this.internal.city.length) return
      const pool = this.buildDistrictPool()
      if (!query) {
        this.districtOptions = this.mergeWithSelected(pool, this.internal.district)
        return
      }
      this.districtLoading = true
      try {
        const results = await mockFetchDistricts(query, this.internal.province, this.internal.city)
        this.districtOptions = this.mergeWithSelected(results, this.internal.district)
      } finally {
        this.districtLoading = false
      }
    },

    // ==================== 数据获取 ====================

    async fetchAllProvinces() {
      this.allProvinceCache = await mockFetchProvinces('')
    },

    async fetchCitiesForProvince() {
      const selected = new Set(this.internal.province)
      // 清除不再选中的省份缓存
      Object.keys(this.cachedCitiesMap).forEach(pid => {
        if (!selected.has(pid)) delete this.cachedCitiesMap[pid]
      })
      const missing = this.internal.province.filter(pid => !this.cachedCitiesMap[pid])
      if (missing.length) {
        const results = await mockFetchCities('', missing)
        missing.forEach(pid => {
          const prefix = pid.substring(0, 2)
          this.cachedCitiesMap[pid] = results.filter(c => c.value.startsWith(prefix))
        })
      }
      this.rebuildCityOptions()
    },

    async fetchDistrictsForCity() {
      const selected = new Set(this.internal.city)
      Object.keys(this.cachedDistrictsMap).forEach(cid => {
        if (!selected.has(cid)) delete this.cachedDistrictsMap[cid]
      })
      const missing = this.internal.city.filter(cid => !this.cachedDistrictsMap[cid])
      if (missing.length) {
        const results = await mockFetchDistricts('', this.internal.province, missing)
        // 按城市分配区县缓存：先用前4位匹配，无匹配则用前2位（直辖市如110000）
        missing.forEach(cid => {
          const cp4 = cid.substring(0, 4)
          const matchedByP4 = results.filter(d => d.value.startsWith(cp4))
          this.cachedDistrictsMap[cid] = matchedByP4.length > 0
            ? matchedByP4
            : results.filter(d => d.value.startsWith(cid.substring(0, 2)))
        })
      }
      this.rebuildDistrictOptions()
    },

    /** 从缓存构建当前城市选项池（去重） */
    buildCityPool() {
      const seen = new Set()
      const all = []
      this.internal.province.forEach(pid => {
        (this.cachedCitiesMap[pid] || []).forEach(c => {
          if (!seen.has(c.value)) {
            seen.add(c.value)
            all.push(c)
          }
        })
      })
      return all
    },

    /** 从缓存构建当前区县选项池（去重） */
    buildDistrictPool() {
      const seen = new Set()
      const all = []
      this.internal.city.forEach(cid => {
        (this.cachedDistrictsMap[cid] || []).forEach(d => {
          if (!seen.has(d.value)) {
            seen.add(d.value)
            all.push(d)
          }
        })
      })
      return all
    },

    rebuildCityOptions() {
      this.cityOptions = this.buildCityPool()
    },

    rebuildDistrictOptions() {
      this.districtOptions = this.buildDistrictPool()
    },

    // ==================== 数据合并工具 ====================

    mergeWithSelected(results, selected) {
      const resultSet = new Set(results.map(r => r.value))
      const extra = []
      selected.forEach(v => {
        if (!resultSet.has(v)) {
          const cached = this.findInCaches(v)
          if (cached) extra.push(cached)
        }
      })
      return [...results, ...extra]
    },

    findInCaches(value) {
      const prov = this.allProvinceCache.find(p => p.value === value)
      if (prov) return prov
      for (const pid of Object.keys(this.cachedCitiesMap)) {
        const city = this.cachedCitiesMap[pid].find(c => c.value === value)
        if (city) return city
      }
      for (const cid of Object.keys(this.cachedDistrictsMap)) {
        const dist = this.cachedDistrictsMap[cid].find(d => d.value === value)
        if (dist) return dist
      }
      return null
    },

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

    ensureSelectedInDistrictOptions() {
      const currentSet = new Set(this.districtOptions.map(d => d.value))
      const missing = this.internal.district.filter(d => !currentSet.has(d))
      if (missing.length) {
        const extra = missing.map(d => {
          const found = this.findInCaches(d)
          return found || { label: d, value: d }
        })
        this.districtOptions = [...this.districtOptions, ...extra]
      }
    },

    // ==================== 变更事件 ====================

    emitChange() {
      this.$emit('input', {
        province: [...this.internal.province],
        city: [...this.internal.city],
        district: [...this.internal.district]
      })
    },

    async onProvinceChange() {
      if (this.internal.province.length) {
        await this.fetchCitiesForProvince()
        // 过滤城市
        const validCitySet = new Set(this.cityOptions.map(c => c.value))
        this.internal.city = this.internal.city.filter(c => validCitySet.has(c))
        
        // ⭐ 新增：过滤区县（而不是直接清空）
        if (this.internal.city.length) {
          await this.fetchDistrictsForCity()
          const validDistrictSet = new Set(this.districtOptions.map(d => d.value))
          this.internal.district = this.internal.district.filter(d => validDistrictSet.has(d))
        } else {
          // 如果没有合法城市，才清空区县
          this.cachedDistrictsMap = {}
          this.districtOptions = []
          this.internal.district = []
        }
      } else {
        // 没有省份，清空所有
        this.cachedCitiesMap = {}
        this.cityOptions = []
        this.internal.city = []
        this.cachedDistrictsMap = {}
        this.districtOptions = []
        this.internal.district = []
      }
      
      this.emitChange()
    },

    async onCityChange() {
      if (this.internal.city.length) {
        await this.fetchDistrictsForCity()
        const validSet = new Set(this.districtOptions.map(d => d.value))
        this.internal.district = this.internal.district.filter(d => validSet.has(d))
      } else {
        this.cachedDistrictsMap = {}
        this.districtOptions = []
        this.internal.district = []
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
