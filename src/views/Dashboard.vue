<template>
  <div class="dashboard">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">用户管理</el-menu-item>
      <el-menu-item index="3">订单管理</el-menu-item>
      <!-- 新增：添加测试人员列表菜单项 -->
      <el-menu-item index="4">测试人员列表</el-menu-item>
    </el-menu>
    <div class="content">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>用户统计</span>
            </div>
            <div>总用户数: 1000</div>
            <div>活跃用户: 500</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>订单统计</span>
            </div>
            <div>总订单: 200</div>
            <div>待处理: 20</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>销售额</span>
            </div>
            <div>本月: ¥50,000</div>
            <div>上月: ¥45,000</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>其他</span>
            </div>
            <div>待定</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      activeIndex: '1'
    }
  },
  methods: {
    handleSelect(key) {
      // 定义允许的路由白名单
      const allowedRoutes = ['/', '/home', '/user-management', '/order-management', '/tester-list'];
      
      // 验证key是否为预期的路由
      if (!allowedRoutes.includes(key)) {
        console.warn(`Invalid route: ${key}`);
        return;
      }
      
      // 执行路由跳转，并处理可能的错误
      this.$router.push(key).catch(error => {
        if (error.name !== 'NavigationDuplicated') {
          console.error('Router navigation error:', error);
        }
      });
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.content {
  margin-top: 20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>