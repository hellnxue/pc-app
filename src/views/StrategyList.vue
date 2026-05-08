<template>
  <div class="strategy-list">
    <h2>任务列表</h2>
    <el-form :inline="true" class="filter-form" style="margin-bottom: 16px;">
      <el-form-item>
        <el-input v-model="filters.keyword" placeholder="请输入任务名称/跟进员工/创建人" clearable style="width: 250px;" />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="filters.status"
          multiple
          collapse-tags
          placeholder="是否启用"
          style="width: 180px;"
          @change="handleStatusChange"
        >
          <el-option label="全部" value="all" />
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="filterList">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="addStrategy">新增任务·分支</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="filteredStrategies" border style="width: 100%;" stripe>
      <el-table-column prop="index" label="序号" width="70" type="index" />
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="customerScope" label="客户范围" />
      <el-table-column prop="employees" label="跟进员工" />
      <el-table-column prop="assignMode" label="任务执行方式" />
      <el-table-column prop="schedule" label="定时分配时间" />
      <el-table-column prop="endTime" label="任务结束时间" />
      <el-table-column prop="serviceRequirement" label="服务要求" />
      <el-table-column prop="statusLabel" label="是否启用" />
      <el-table-column prop="creator" label="创建人" />
      <el-table-column prop="updatedAt" label="更新时间" />
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-link type="primary" @click.prevent="viewStrategy(scope.row)">查看</el-link>
          <el-link type="success" @click.prevent="toggleStatus(scope.row)">{{ scope.row.status === 'enabled' ? '停用' : '启用' }}</el-link>
          <el-link type="warning" @click.prevent="editStrategy(scope.row)">编辑</el-link>
          <el-link type="danger" @click.prevent="deleteStrategy(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; text-align: right;">
      <el-pagination
        layout="total, prev, pager, next, jumper"
        :total="filteredStrategies.length"
        :page-size="pageSize"
        :current-page.sync="currentPage"
        @current-change="handlePageChange" />
    </div>
    
    <!-- 编辑策略对话框 -->
    <edit-strategy-dialog
      :visible.sync="dialogVisible"
      :strategy-data="currentStrategy"
      @save="onSaveStrategy"
    />
  </div>
</template>

<script>
import EditStrategyDialog from '@/components/EditStrategyDialog.vue'

export default {
  name: 'StrategyList',
  components: {
    EditStrategyDialog
  },
  data() {
    return {
      filters: {
        keyword: '',
        status: []
      },
      strategies: [
        {
          id: 1,
          name: '其他自动',
          customerScope: '其他',
          employees: '周...',
          assignMode: '实时分配',
          schedule: '长期有效',
          endTime: '长期有效',
          serviceRequirement: '其他自动，每月31...',
          status: 'disabled',
          creator: '小明',
          updatedAt: '2026-03-23 15:11'
        },
        {
          id: 2,
          name: 'HEllo自动',
          customerScope: 'HEllo',
          employees: '小红(离职), ...',
          assignMode: '实时分配',
          schedule: '长期有效',
          endTime: '长期有效',
          serviceRequirement: 'HEllo,...',
          status: 'enabled',
          creator: '小明',
          updatedAt: '2026-03-23 15:11'
        },
        {
          id: 3,
          name: 'World员工自动',
          customerScope: 'World员工',
          employees: '小红(离职), ...',
          assignMode: '实时分配',
          schedule: '指定日期',
          endTime: '指定日期 自收到任务起... ',
          serviceRequirement: 'World员工客户范围...',
          status: 'enabled',
          creator: '小明',
          updatedAt: '2026-03-23 15:11'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      currentStrategy: {}
    }
  },
  computed: {
    filteredStrategies() {
      let data = this.strategies
      if (this.filters.keyword) {
        const k = this.filters.keyword.trim().toLowerCase()
        data = data.filter(item =>
          [item.name, item.customerScope, item.employees, item.creator]
            .join(' ')
            .toLowerCase()
            .includes(k)
        )
      }
      if (this.filters.status.length > 0) {
        // 如果包含"全部"选项，则不过滤（显示所有）
        if (this.filters.status.includes('all')) {
          // 不做任何过滤
        } else {
          data = data.filter(item => this.filters.status.includes(item.status))
        }
      }
      return data.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    }
  },
  methods: {
    filterList() {
      this.currentPage = 1
    },
    resetFilters() {
      this.filters.keyword = ''
      this.filters.status = []
      this.currentPage = 1
    },
    handleStatusChange(val) {
      const allOptions = ['enabled', 'disabled']
      // 点击"全部"
      if (val.includes('all')) {
        // if (val.length > 1) {
        //   // 已选中其他选项，再点击全部 -> 只保留全部
        //   this.filters.status = ['all']
        // } else {
        //   // 只有全部被点击 -> 选中所有
        //   this.filters.status = allOptions
        // }
        this.filters.status = allOptions
      } else {
        // 没有点击全部，检查是否所有选项都被选中
        if (val.length === allOptions.length) {
          // 所有选项都选中了，自动勾选全部
          this.filters.status = [...allOptions]
        }
      }
    },
    addStrategy() {
      this.$message({ type: 'success', message: '新增任务·分支操作' })
    },
    viewStrategy(row) {
      this.$message(`查看任务: ${row.name}`)
    },
    toggleStatus(row) {
      row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
      this.$message.success(`已${row.status === 'enabled' ? '启用' : '停用'}：${row.name}`)
    },
    editStrategy(row) {
      this.currentStrategy = { ...row }
      this.dialogVisible = true
    },
    deleteStrategy(row) {
      this.$confirm(`确定删除任务 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.strategies = this.strategies.filter(item => item.id !== row.id)
        this.$message.success('删除成功')
      })
    },
    handlePageChange(page) {
      this.currentPage = page
    },
    onSaveStrategy(formData) {
      // 这里可以调用API保存数据
      this.$message({
        type: 'success',
        message: `保存成功 - 任务名称: ${formData.name}, 间隔: ${formData.interval}分钟, 状态: ${formData.status}`
      })
      // 更新strategies数组中的相应项
      const index = this.strategies.findIndex(item => item.id === this.currentStrategy.id)
      if (index !== -1) {
        this.strategies[index] = { ...this.strategies[index], ...formData }
      }
    }
  }
}
</script>

<style scoped>
.strategy-list {
  padding: 20px;
}
.filter-form {
  margin-bottom: 12px;
}
</style>