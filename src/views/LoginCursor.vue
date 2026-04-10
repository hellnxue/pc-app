<template>
  <div class="cursor-login-container">
    <div class="login-card">
      <h2 class="section-heading">欢迎回来</h2>
      
      <p class="subtitle">使用您的 Cursor 账户登录</p>
      
      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
        <el-form-item prop="username" class="form-item">
          <label class="input-label">电子邮件</label>
          <el-input 
            v-model="loginForm.username" 
            placeholder="输入您的电子邮件地址" 
            class="cursor-input"
          />
        </el-form-item>
        
        <el-form-item prop="password" class="form-item">
          <label class="input-label">
            密码
            <a href="#" class="forgot-password">忘记密码?</a>
          </label>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="输入您的密码" 
            class="cursor-input"
          />
        </el-form-item>
        
        <div class="remember-me">
          <el-checkbox v-model="rememberMe" class="cursor-checkbox">记住这台设备</el-checkbox>
        </div>
        
        <el-button 
          type="primary" 
          @click="submitForm" 
          class="cursor-primary-btn"
        >
          登录
        </el-button>
      </el-form>
      
      <div class="divider">
        <span class="divider-text">或</span>
      </div>
      
      <el-button 
        class="cursor-secondary-btn"
        @click="socialLogin('github')"
      >
        使用 GitHub 登录
      </el-button>
      
      <el-button 
        class="cursor-secondary-btn"
        @click="socialLogin('google')"
      >
        使用 Google 登录
      </el-button>
      
      <p class="signup-text">
        还没有账户? <a href="#" class="signup-link">创建账户</a>
      </p>
    </div>
    
    <div class="footer-links">
      <a href="#">隐私政策</a>
      <span class="separator">•</span>
      <a href="#">条款与条件</a>
      <span class="separator">•</span>
      <a href="#">帮助中心</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginCursor',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rememberMe: false,
      rules: {
        username: [
          { required: true, message: '请输入您的电子邮件地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的电子邮件地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入您的密码', trigger: 'blur' },
          { min: 8, message: '密码长度至少为8位', trigger: 'blur' }
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
    },
    socialLogin(provider) {
      console.log(`${provider} 社交登录`)
      // 在实际项目中这里会调用相应的社交登录API
    }
  }
}
</script>

<style scoped>
.cursor-login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f2f1ed; /* Warm off-white background as per Cursor design */
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  background: #e6e5e0; /* Warm cream background */
  border: 1px solid rgba(38, 37, 30, 0.1); /* Warm brown border at 10% opacity */
  border-radius: 8px; /* Standard Cursor radius */
  box-shadow: 
    rgba(0, 0, 0, 0.14) 0px 28px 70px, 
    rgba(0, 0, 0, 0.1) 0px 14px 32px, 
    rgba(38, 37, 30, 0.1) 0px 0px 0px 1px; /* Card shadow with warm border ring */
  text-align: center;
}

.section-heading {
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 36px; /* Section heading size */
  font-weight: 400; /* 400 weight */
  color: #26251e; /* Warm near-black text */
  margin: 0 0 10px 0;
  line-height: 1.20; /* Tight line height */
  letter-spacing: -0.72px; /* Compressed tracking for 36px */
}

.subtitle {
  font-family: 'jjannon', 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', 'P052', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', serif;
  font-size: 17.28px; /* Body size */
  font-weight: 400; /* Regular weight */
  color: rgba(38, 37, 30, 0.55); /* Secondary text color */
  margin-bottom: 30px;
  line-height: 1.35; /* Body line height */
}

.login-form {
  width: 100%;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 24px;
  text-align: left;
}

.input-label {
  display: block;
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 16px; /* Body size */
  font-weight: 400; /* Regular weight */
  color: #26251e; /* Warm near-black */
  margin-bottom: 8px;
  line-height: 1.50; /* Body line height */
}

.forgot-password {
  float: right;
  font-size: 14px;
  color: #f54e00; /* Cursor Orange */
  text-decoration: none;
  font-weight: 400;
}

.forgot-password:hover {
  text-decoration: underline;
}

.cursor-input ::v-deep .el-input__inner {
  font-family: system-ui, 'CursorGothic', 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 16px;
  color: #26251e; /* Warm near-black */
  padding: 10px 12px;
  border-radius: 4px; /* Compact input radius */
  border: 1px solid rgba(38, 37, 30, 0.1); /* Warm brown border at 10% */
  background-color: #f7f7f4; /* Surface 100 */
  transition: all 0.2s ease-in-out;
  line-height: 1.50; /* Body line height */
}

.cursor-input ::v-deep .el-input__inner:focus {
  border-color: #f54e00; /* Cursor Orange focus */
  box-shadow: 0 0 0 2px rgba(245, 78, 0, 0.2); /* Orange focus ring */
}

.remember-me {
  text-align: left;
  margin-bottom: 24px;
}

.cursor-checkbox ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
  color: #26251e; /* Warm near-black */
  font-weight: 400;
}

.cursor-checkbox ::v-deep .el-checkbox__inner {
  border-radius: 2px; /* Small container radius */
  border: 1px solid rgba(38, 37, 30, 0.1); /* Warm brown border */
  background-color: #f7f7f4; /* Surface 100 */
}

.cursor-checkbox ::v-deep .el-checkbox__inner::after {
  border: 1px solid #f54e00; /* Cursor Orange checkmark */
  border-left: 0;
  border-top: 0;
}

.cursor-primary-btn {
  width: 100%;
  background-color: #ebeae5; /* Warm Surface */
  color: #26251e; /* Cursor Dark */
  padding: 10px 14px;
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 400; /* Regular weight */
  border-radius: 8px; /* Standard Cursor radius */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 20px;
}

.cursor-primary-btn:hover {
  color: #cf2d56; /* Error/warm crimson on hover */
}

.cursor-primary-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #f2f1ed, 0 0 0 4px rgba(0, 0, 0, 0.1); /* Focus ring */
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid rgba(38, 37, 30, 0.1); /* Warm brown border */
}

.divider-text {
  padding: 0 10px;
  color: rgba(38, 37, 30, 0.55); /* Secondary text */
  font-size: 11px;
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
}

.cursor-secondary-btn {
  width: 100%;
  background-color: #e6e5e0; /* Surface 400 */
  color: rgba(38, 37, 30, 0.6); /* 60% warm brown */
  padding: 10px 14px;
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 400; /* Regular weight */
  border-radius: 33.5em; /* Full pill-shaped button */
  border: none;
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.2s ease-in-out;
}

.cursor-secondary-btn:hover {
  color: #cf2d56; /* Error/warm crimson on hover */
}

.signup-text {
  margin-top: 25px;
  font-size: 14px;
  color: rgba(38, 37, 30, 0.55); /* Secondary text */
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
}

.signup-link {
  color: #f54e00; /* Cursor Orange */
  text-decoration: none;
  font-weight: 400;
}

.signup-link:hover {
  text-decoration: underline;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  font-size: 11px;
  color: rgba(38, 37, 30, 0.55); /* Secondary text */
  font-family: 'CursorGothic', system-ui, 'Helvetica Neue', 'Arial', sans-serif;
}

.footer-links a {
  color: rgba(38, 37, 30, 0.55); /* Secondary text */
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.separator {
  color: rgba(38, 37, 30, 0.55); /* Secondary text */
}
</style>