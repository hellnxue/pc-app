<template>
  <div class="airbnb-login-container">
    <div class="login-card">
      <h2 class="section-heading">欢迎回来</h2>
      
      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
        <el-form-item prop="username" class="form-item">
          <label class="input-label">用户名</label>
          <el-input 
            v-model="loginForm.username" 
            placeholder="输入您的用户名" 
            class="airbnb-input"
          />
        </el-form-item>
        
        <el-form-item prop="password" class="form-item">
          <label class="input-label">密码</label>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="输入您的密码" 
            class="airbnb-input"
          />
        </el-form-item>
        
        <el-button 
          type="primary" 
          @click="submitForm" 
          class="airbnb-primary-btn"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // 这里应该调用实际的登录API
          console.log('登录提交:', this.loginForm)
          
          // 模拟登录成功
          this.$message.success('登录成功')
          
          // 根据安全规范，跳转到仪表盘页面
          this.$router.push({ path: '/dashboard' })
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.airbnb-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff; /* 纯白色背景 */
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #ffffff; /* 纯白色卡片 */
  border-radius: 20px; /* 20px圆角 */
  /* 三段式阴影效果 */
  box-shadow: 
    rgba(0,0,0,0.02) 0px 0px 0px 1px, 
    rgba(0,0,0,0.04) 0px 2px 6px, 
    rgba(0,0,0,0.1) 0px 4px 8px;
}

.section-heading {
  font-family: 'Helvetica Neue', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Microsoft YaHei';
  font-size: 28px; /* 28px标题 */
  font-weight: 700; /* 700粗体 */
  color: #222222; /* Near Black文字 */
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.43; /* 行高1.43 */
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-family: 'Helvetica Neue', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Microsoft YaHei';
  font-size: 14px;
  font-weight: 500;
  color: #222222; /* Near Black文字 */
  margin-bottom: 8px;
}

.airbnb-input ::v-deep .el-input__inner {
  font-family: 'Helvetica Neue', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Microsoft YaHei';
  font-size: 14px;
  color: #222222; /* Near Black文字 */
  padding: 12px 16px;
  border-radius: 8px; /* 8px圆角 */
  border: 1px solid #c1c1c1; /* Border Gray边框 */
  transition: all 0.2s ease-in-out;
}

.airbnb-input ::v-deep .el-input__inner:focus {
  border-color: #ff385c; /* Rausch Red焦点色 */
  box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2); /* 红色焦点环 */
}

.airbnb-primary-btn {
  width: 100%;
  background-color: #222222; /* Near Black背景 */
  color: #ffffff; /* 白色文字 */
  padding: 12px 24px;
  font-family: 'Helvetica Neue', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Microsoft YaHei';
  font-size: 16px;
  font-weight: 500; /* 500中等字重 */
  border-radius: 8px; /* 8px圆角 */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.airbnb-primary-btn:hover {
  background-color: #ff385c; /* Rausch Red悬停色 */
  transform: scale(0.98); /* 轻微缩放效果 */
}

.airbnb-primary-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px rgba(34, 34, 34, 0.3);
}
</style>