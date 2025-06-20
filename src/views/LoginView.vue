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
      <div class="forgot-password">
        <router-link to="/forgot-password">忘记密码？</router-link>
      </div>
      <button type="submit" class="login-btn">登录</button>
    </form>
    <p class="register-link">
      还没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script>
// 添加导入语句
import api from '@/axios';

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
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await api.post('/auth/login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        localStorage.setItem('userRole', response.role);
        
        // 根据角色跳转到不同页面
        if (response.role === 'TEACHER') {
          this.$router.push('/teacher');
        } else if (response.role === 'STUDENT'){
          this.$router.push('/student');
        }else{
          this.$router.push('/admin');
        }
        
      } catch (error) {
        console.error('登录失败:', error);
        this.errorMessage = error.response?.data?.error || '用户名或密码错误';
      } finally {
        this.loading = false;
      }
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
