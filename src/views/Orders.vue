<template>
  <div class="orders">
    <h2>订单管理</h2>
    <el-button type="primary" @click="addOrder">添加订单</el-button>
    <el-table :data="orders" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="订单ID" width="150"></el-table-column>
      <el-table-column prop="customer" label="客户" width="150"></el-table-column>
      <el-table-column prop="amount" label="金额"></el-table-column>
      <el-table-column prop="status" label="状态"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewOrder(scope.row)">查看</el-button>
          <el-button size="mini" type="danger" @click="cancelOrder(scope.row)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Orders',
  data() {
    return {
      orders: [
        { id: '001', customer: '张三', amount: '¥100', status: '待处理' },
        { id: '002', customer: '李四', amount: '¥200', status: '已完成' },
        { id: '003', customer: '王五', amount: '¥150', status: '进行中' }
      ]
    }
  },
  methods: {
    addOrder() {
      this.$message('添加订单功能待实现')
    },
    viewOrder(order) {
      this.$message(`查看订单: ${order.id}`)
    },
    cancelOrder(order) {
      this.$confirm(`确定取消订单 ${order.id} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        order.status = '已取消'
        this.$message.success('订单已取消')
      })
    }
  }
}
</script>

<style scoped>
.orders {
  padding: 20px;
}
</style>