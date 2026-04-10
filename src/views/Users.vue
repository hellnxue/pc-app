<template>
  <div class="users">
    <h2>用户管理</h2>
    <el-button type="primary" @click="addUser">添加用户</el-button>
    <el-table :data="users" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="role" label="角色"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="editUser(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      users: [
        { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
        { name: '李四', email: 'lisi@example.com', role: '用户' },
        { name: '王五', email: 'wangwu@example.com', role: '用户' }
      ]
    }
  },
  methods: {
    addUser() {
      this.$message('添加用户功能待实现')
    },
    editUser(user) {
      this.$message(`编辑用户: ${user.name}`)
    },
    deleteUser(user) {
      this.$confirm(`确定删除用户 ${user.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.users = this.users.filter(u => u !== user)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>

<style scoped>
.users {
  padding: 20px;
}
</style>