<template>
  <div class="test-person-list">
    <!-- 页面标题 -->
    <h2>测试人员列表</h2>

    <!-- 查询条件区域 -->
    <el-form :inline="true" class="query-form">
      <el-form-item label="流程结束日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="IB人员分类">
        <el-select v-model="ibPersonType" placeholder="请选择">
          <el-option label="全部" value=""></el-option>
          <el-option label="类型1" value="type1"></el-option>
          <el-option label="类型2" value="type2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="keyword" placeholder="OA流程单号/人员姓名/人员编号/证"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="index" label="序号" width="50"></el-table-column>
      <el-table-column prop="processType" label="流程类型"></el-table-column>
      <el-table-column prop="oaProcessNo" label="OA流程单号"></el-table-column>
      <el-table-column prop="businessDept" label="咖啡馆"></el-table-column>
      <el-table-column prop="hrCode" label="咖啡馆HR编码"></el-table-column>
      <el-table-column prop="counterCode" label="柜台代码"></el-table-column>
      <el-table-column prop="generalManager" label="咖啡馆总经理"></el-table-column>
      <el-table-column prop="ftpCode" label="qhFTP编码"></el-table-column>
      <el-table-column prop="personType" label="人员分类"></el-table-column>
      <el-table-column prop="personName" label="人员姓名"></el-table-column>
      <el-table-column prop="personNo" label="人员编号"></el-table-column>
      <el-table-column prop="idCardNo" label="身份证号"></el-table-column>
      <el-table-column prop="fixedPhone" label="固定电话"></el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="total, prev, pager, next, jumper"
      :total="total"
      :current-page="currentPage"
      @current-change="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateRange: [],
      ibPersonType: '',
      keyword: '',
      tableData: [
        // 示例数据
        {
          index: 1,
          processType: 'IBqh人员新增',
          oaProcessNo: 'OA-1001',
          businessDept: 'XXXX咖啡馆2',
          hrCode: 'HR101',
          counterCode: '柜台2',
          generalManager: '张B',
          ftpCode: 'FTP201',
          personType: '其他',
          personName: '人员1',
          personNo: 'P3001',
          idCardNo: '320101199000011234',
          fixedPhone: '010-5555-0001'
        },
        // 其他数据项...
      ],
      total: 6,
      currentPage: 1
    };
  },
  methods: {
    handleQuery() {
      // 查询逻辑
    },
    handleReset() {
      // 重置逻辑
    },
    handleExport() {
      // 导出逻辑
    },
    handlePageChange(page) {
      this.currentPage = page;
      // 分页逻辑
    }
  }
};
</script>

<style scoped>
.test-person-list {
  padding: 20px;
}
.query-form {
  margin-bottom: 20px;
}
</style>