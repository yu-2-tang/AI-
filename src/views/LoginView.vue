<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>用户名</label>
        <input 
          v-model="loginForm.username" 
          type="text" 
          placeholder="请输入用户名"
          required
        >
      </div>
      <div class="form-group">
        <label>密码</label>
        <input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码"
          required
        >
      </div>
      <div class="remember-forgot">
        <label class="remember-me">
          <input type="checkbox" v-model="loginForm.rememberMe">
          记住我
        </label>
        <router-link to="/forgot-password" class="forgot-password">忘记密码？</router-link>
      </div>
      <button type="submit" class="login-btn">登录</button>
    </form>
    <p class="register-link">
      还没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      }
    }
  },
  methods: {
    handleLogin() {
      // 这里添加实际登录逻辑
      console.log('登录信息:', this.loginForm)
      
      // 模拟登录成功后跳转到首页
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background: white;
}

.login-container h2 {
  text-align: center;
  color: #3a7bd5;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus {
  border-color: #3a7bd5;
  outline: none;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  font-size: 14px;
  color: #3a7bd5;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #3a7bd5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2c6bc7;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #3a7bd5;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>