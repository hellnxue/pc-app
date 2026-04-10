<template>
  <div class="futures-personnel-list">
    <h2>qh人员新增列表</h2>

    <el-form :inline="true" class="filter-form" style="margin-bottom: 16px;">
      <el-form-item label="流程结束日期">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 320px;"
        />
      </el-form-item>
      <el-form-item label="cc人员分类">
        <el-select v-model="filters.ibCategory" placeholder="请选择" clearable style="width: 180px;">
          <el-option label="负责人/cc业务运营/cc业务人员" value="1" />
          <el-option label="其他" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="资格">
        <el-select v-model="filters.qualification" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="开启" value="开启" />
          <el-option label="关闭" value="关闭" />
        </el-select>
      </el-form-item>
      <el-form-item label="省份">
        <el-select v-model="filters.province" placeholder="请选择" clearable style="width: 120px;" @change="onProvinceChange">
          <el-option 
            v-for="prov in provinceCityList" 
            :key="prov.label" 
            :label="prov.label" 
            :value="prov.label" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="城市">
        <el-select v-model="filters.city" placeholder="请选择" clearable style="width: 120px;" :disabled="!filters.province">
          <el-option 
            v-for="city in cityOptions" 
            :key="city.value" 
            :label="city.label" 
            :value="city.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属公司">
        <el-select v-model="filters.company" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="A" value="A" />
          <el-option label="B" value="B" />
          <el-option label="C" value="C" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属辖区监管局">
        <el-select v-model="filters.supervisionDept" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="A" value="A" />
          <el-option label="B" value="B" />
          <el-option label="C" value="C" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="filters.keyword" placeholder="OA流程单号/人员姓名/人员编号/证件号" clearable style="width: 260px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
        <el-button icon="el-icon-refresh" @click="onReset">重置</el-button>
        <el-button icon="el-icon-download" type="success" @click="onExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="paginatedData" border stripe style="width: 100%;">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column
        v-for="col in columnList"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template slot-scope="scope" v-if="col.prop === 'status'">
          {{ statuEnum[scope.row.status] || scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="160">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="viewRow(scope.row)">查看</el-button>
          <el-button type="text" size="small" @click="editRow(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="paging" style="margin-top: 16px; text-align: right;">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :total="filteredData.length"
        :page-size="pageSize"
        :current-page.sync="currentPage"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FuturesPersonnelList',
  data() {
    const sample = []
    for (let i = 1; i <= 67; i++) {
      sample.push({
        id: i,
        processType: i % 2 === 0 ? 'ccqh人员新增' : 'ccqh人员新增',
        oaNo: `OA-${1000 + i}`,
        department: `XXXX咖啡馆${(i % 5) + 1}`,
        hrCode: `HR${100 + i}`,
        counterCode: `柜台${(i % 6) + 1}`,
        manager: `张${String.fromCharCode(65 + (i % 10))}`,
        ftpCode: `FTP${200 + i}`,
        personnelCategory: i % 2 === 0 ? '负责人/cc业务运营/cc业务人员' : '其他',
        name: `人员${i}`,
        staffNo: `P${3000 + i}`,
        idNo: `3201011990${String(i).padStart(4, '0')}1234`, 
        phone: `010-5555-${String(i).padStart(4, '0')}`,
        mobile: `1380000${String(i).padStart(4, '0')}`,
        email: `person${i}@example.com`, 
        futuresCert: `FUT${4000 + i}`,
        status: i % 3 === 0 ? 0 : 1,
        netAccess: i % 2 === 0 ? '开' : '关',
        endDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
        remark: i % 2 === 0 ? '申请说明示例内容' : '测试说明内容',
        qualification: i % 2 === 0 ? '开启' : '关闭',
        province: ['北京', '上海', '广州', '深圳'][(i - 1) % 4],
        city: ['北京市', '上海市', '广州市', '深圳市', '朝阳区', '黄浦区', '天河区', '南山区'][(i - 1) % 8],
        company: ['A', 'B', 'C'][(i - 1) % 3],
        supervisionDept: ['A', 'B', 'C'][(i - 1) % 3]
      })
    }

    return {
      statuEnum: {
        0: '停用',
        1: '正常'
      },
      filters: {
        dateRange: [],
        ibCategory: '',
        qualification: '',
        province: '',
        city: '',
        company: '',
        supervisionDept: '',
        keyword: ''
      },
      allData: sample,
      currentPage: 1,
      pageSize: 10,
      cityOptions: [], // 城市选项
      // 定义省份城市数据
      provinceCityList: [
        {
          label: '北京',
          cityList: [
            { label: '北京市', value: '北京市' },
            { label: '朝阳区', value: '朝阳区' },
            { label: '海淀区', value: '海淀区' },
            { label: '东城区', value: '东城区' }
          ]
        },
        {
          label: '上海',
          cityList: [
            { label: '上海市', value: '上海市' },
            { label: '黄浦区', value: '黄浦区' },
            { label: '静安区', value: '静安区' },
            { label: '徐汇区', value: '徐汇区' }
          ]
        },
        {
          label: '广州',
          cityList: [
            { label: '广州市', value: '广州市' },
            { label: '天河区', value: '天河区' },
            { label: '越秀区', value: '越秀区' },
            { label: '黄埔区', value: '黄埔区' }
          ]
        },
        {
          label: '深圳',
          cityList: [
            { label: '深圳市', value: '深圳市' },
            { label: '南山区', value: '南山区' },
            { label: '福田区', value: '福田区' },
            { label: '宝安区', value: '宝安区' }
          ]
        }
      ],
      provincesCitiesMap: {}, // 将在下方初始化
      columnList: [
        { prop: 'processType', label: '流程类型', width: 130 },
        { prop: 'oaNo', label: 'OA流程单号', width: 160 },
        { prop: 'department', label: '咖啡馆', width: 160 },
        { prop: 'hrCode', label: '咖啡馆HR编码', width: 150 },
        { prop: 'counterCode', label: '柜台代码', width: 110 },
        { prop: 'manager', label: '咖啡馆总经理', width: 150 },
        { prop: 'ftpCode', label: 'qhFTP编码', width: 130 },
        { prop: 'personnelCategory', label: '人员分类', width: 130 },
        { prop: 'name', label: '人员姓名', width: 120 },
        { prop: 'staffNo', label: '人员编号', width: 120 },
        { prop: 'idNo', label: '身份证号', width: 160 },
        { prop: 'phone', label: '固定电话', width: 140 },
        { prop: 'mobile', label: '手机', width: 120 },
        { prop: 'email', label: '邮箱地址', width: 200 },
        { prop: 'futuresCert', label: 'qh资格证号', width: 150 },
        { prop: 'status', label: '人员状态', width: 100 },
        { prop: 'netAccess', label: '网开权限', width: 100 },
        { prop: 'endDate', label: '流程结束日期', width: 130 },
        { prop: 'remark', label: '申请说明', width: 220 },
        { prop: 'qualification', label: '资格', width: 100 },
        { prop: 'province', label: '省份', width: 100 },
        { prop: 'city', label: '城市', width: 100 },
        { prop: 'company', label: '所属公司', width: 120 },
        { prop: 'supervisionDept', label: '所属辖区监管局', width: 150 }
      ]
    }
  },
  created() {
    // 从 provinceCityList 生成 provincesCitiesMap
    this.provincesCitiesMap = {};
    this.provinceCityList.forEach(province => {
      this.provincesCitiesMap[province.label] = province.cityList;
    });
  },
  computed: {
    filteredData() {
      let data = this.allData
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        const [start, end] = this.filters.dateRange
        data = data.filter(item => item.endDate >= start && item.endDate <= end)
      }
      if (this.filters.ibCategory) {
        data = data.filter(item => item.personnelCategory === this.filters.ibCategory)
      }
      if (this.filters.qualification) {
        data = data.filter(item => item.qualification === this.filters.qualification)
      }
      if (this.filters.province) {
        data = data.filter(item => item.province === this.filters.province)
      }
      if (this.filters.city) {
        data = data.filter(item => item.city === this.filters.city)
      }
      if (this.filters.company) {
        data = data.filter(item => item.company === this.filters.company)
      }
      if (this.filters.supervisionDept) {
        data = data.filter(item => item.supervisionDept === this.filters.supervisionDept)
      }
      if (this.filters.keyword) {
        const keyword = this.filters.keyword.trim().toLowerCase()
        data = data.filter(item => {
          return [item.oaNo, item.name, item.staffNo, item.idNo, item.department, item.processType, item.qualification, item.province, item.city, item.company, item.supervisionDept]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        })
      }
      return data
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredData.slice(start, start + this.pageSize)
    }
  },
  methods: {
    replaceField(str,list){
      let str1=str.split('、')
      list.map((item,index)=>{
        item.label=str1[index]
        return item
      })
    },
    onProvinceChange() {
      // 当省份改变时，更新城市选项
      this.filters.city = '';
      if (this.filters.province && this.provincesCitiesMap[this.filters.province]) {
        this.cityOptions = this.provincesCitiesMap[this.filters.province];
      } else {
        this.cityOptions = [];
      }
    },
    onSearch() {
      this.currentPage = 1
    },
    onReset() {
      this.filters.dateRange = []
      this.filters.ibCategory = ''
      this.filters.qualification = ''
      this.filters.province = ''
      this.filters.city = ''
      this.filters.company = ''
      this.filters.supervisionDept = ''
      this.filters.keyword = ''
      this.currentPage = 1
    },
    onExport() {
      this.$message({ type: 'success', message: `导出 ${this.filteredData.length} 条记录` })
    },
    onPageChange(page) {
      this.currentPage = page
    },
    viewRow(row) {
      this.$message(`查看 ${row.name}`)
    },
    editRow(row) {
      this.$message(`编辑 ${row.name}`)
    }
  }
}
</script>

<style scoped>
.futures-personnel-list {
  padding: 20px;
}
.filter-form {
  margin-bottom: 12px;
}
</style>