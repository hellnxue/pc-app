<template>
  <div class="apple-login-container">
    <div class="login-card">
      <h2 class="section-heading">欢迎回来</h2>
      
      <p class="subtitle">使用您的Apple ID登录</p>
      
      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
        <el-form-item prop="username" class="form-item">
          <label class="input-label">电子邮件</label>
          <el-input 
            v-model="loginForm.username" 
            placeholder="输入您的电子邮件地址" 
            class="apple-input"
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
            class="apple-input"
          />
        </el-form-item>
        
        <div class="remember-me">
          <el-checkbox v-model="rememberMe" class="apple-checkbox">记住这台设备</el-checkbox>
        </div>
        
        <el-button 
          type="primary" 
          @click="submitForm" 
          class="apple-primary-btn"
        >
          登录
        </el-button>
      </el-form>
      
      <div class="divider">
        <span class="divider-text">或</span>
      </div>
      
      <el-button 
        class="apple-secondary-btn"
        @click="socialLogin('apple')"
      >
        使用Apple账号继续
      </el-button>
      
      <el-button 
        class="apple-secondary-btn"
        @click="socialLogin('facebook')"
      >
        使用Facebook登录
      </el-button>
      
      <p class="signup-text">
        还没有账户? <a href="#" class="signup-link">创建账户</a>
      </p>
    </div>
    
    <div class="footer-links">
      <a href="#">隐私政策</a>
      <span class="separator">•</span>
      <a href="#">条款与条件</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginApple',
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
.apple-login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f7; /* Light gray background as per Apple design */
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  background: #ffffff;
  border-radius: 8px; /* Standard Apple radius */
  box-shadow: 
    rgba(0, 0, 0, 0.22) 3px 5px 30px 0px; /* Apple-style shadow */
  text-align: center;
}

.section-heading {
  font-family: 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 40px; /* Section heading size */
  font-weight: 600; /* 600 weight */
  color: #1d1d1f; /* Near black text on light background */
  margin: 0 0 10px 0;
  line-height: 1.10; /* Tight line height */
  letter-spacing: normal;
}

.subtitle {
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 17px; /* Body size */
  font-weight: 400; /* Regular weight */
  color: rgba(0, 0, 0, 0.8); /* Secondary text color */
  margin-bottom: 30px;
  line-height: 1.47; /* Body line height */
  letter-spacing: -0.374px; /* Negative tracking */
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
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 17px; /* Body size */
  font-weight: 600; /* Emphasis weight */
  color: #1d1d1f; /* Near black */
  margin-bottom: 8px;
  line-height: 1.24; /* Tight line height for emphasis */
}

.forgot-password {
  float: right;
  font-size: 14px;
  color: #0066cc; /* Link blue on light bg */
  text-decoration: none;
  font-weight: 400;
}

.forgot-password:hover {
  text-decoration: underline;
}

.apple-input ::v-deep .el-input__inner {
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 17px;
  color: #1d1d1f; /* Near black */
  padding: 12px 16px;
  border-radius: 8px; /* Apple-style radius */
  border: 1px solid rgba(0, 0, 0, 0.04); /* Very light border */
  transition: all 0.2s ease-in-out;
  line-height: 1.47; /* Body line height */
  letter-spacing: -0.374px; /* Negative tracking */
}

.apple-input ::v-deep .el-input__inner:focus {
  border-color: #0071e3; /* Apple Blue focus */
  box-shadow: 0 0 0 2px #0071e3; /* Apple Blue focus ring */
}

.remember-me {
  text-align: left;
  margin-bottom: 24px;
}

.apple-checkbox ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
  color: #1d1d1f; /* Near black */
  font-weight: 400;
}

.apple-checkbox ::v-deep .el-checkbox__inner {
  border-radius: 4px; /* Square checkbox as per Apple style */
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.apple-checkbox ::v-deep .el-checkbox__inner::after {
  border: 1px solid #0071e3; /* Apple Blue checkmark */
  border-left: 0;
  border-top: 0;
}

.apple-primary-btn {
  width: 100%;
  background-color: #0071e3; /* Apple Blue */
  color: #ffffff; /* White text */
  padding: 12px 15px;
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 17px;
  font-weight: 400; /* Regular weight */
  border-radius: 8px; /* Apple-style radius */
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 20px;
}

.apple-primary-btn:hover {
  background-color: #2997ff; /* Bright blue on hover */
}

.apple-primary-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0071e3; /* Apple-style focus ring */
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.divider-text {
  padding: 0 10px;
  color: rgba(0, 0, 0, 0.48); /* Tertiary text */
  font-size: 14px;
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

.apple-secondary-btn {
  width: 100%;
  background-color: transparent;
  color: #0066cc; /* Link blue on light bg */
  padding: 12px 15px;
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 17px;
  font-weight: 400; /* Regular weight */
  border-radius: 980px; /* Pill-shaped button */
  border: 1px solid #0066cc; /* Apple blue border */
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.2s ease-in-out;
}

.apple-secondary-btn:hover {
  background-color: rgba(0, 113, 227, 0.05); /* Subtle blue background on hover */
}

.signup-text {
  margin-top: 25px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8); /* Secondary text */
  font-family: 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

.signup-link {
  color: #0066cc; /* Link blue */
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
  font-size: 12px;
  color: rgba(0, 0, 0, 0.48); /* Tertiary text */
}

.footer-links a {
  color: rgba(0, 0, 0, 0.48); /* Tertiary text */
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.separator {
  color: rgba(0, 0, 0, 0.48); /* Tertiary text */
}
</style>