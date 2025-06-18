<template>
  <div class="teacher-dashboard">
    <!-- 导航栏 -->
    <header class="teacher-header">
      <div class="header-content">
        <div class="logo-group">
          <img src="@/assets/logo.png" alt="AI智慧课程平台" class="logo">
          <h1>教师工作台</h1>
        </div>
        <nav class="teacher-nav">
          <router-link to="/teacher/students">
            <i class="el-icon-user"></i>
            <span>学生管理</span>
          </router-link>
          <router-link to="/teacher/courses">
            <i class="el-icon-notebook-2"></i>
            <span>课程管理</span>
          </router-link>
          <router-link to="/teacher/tasks">
            <i class="el-icon-document"></i>
            <span>任务管理</span>
          </router-link>
          <router-link to="/teacher/analytics">
            <i class="el-icon-data-analysis"></i>
            <span>学习分析</span>
          </router-link>
          <router-link to="/teacher/grades">
            <i class="el-icon-data-line"></i>
            <span>成绩管理</span>
          </router-link>
        </nav>
        <div class="user-actions">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="36" :src="userAvatar" class="avatar"></el-avatar>
              <span class="username">{{ userName }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">
                  <i class="el-icon-user"></i>个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="logout" divided>
                  <i class="el-icon-switch-button"></i>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="teacher-main">
      <div class="welcome-banner">
        <h2>欢迎回来，{{ userName }}！</h2>
        <p>今日有 <span class="highlight">3</span> 个待批改作业，<span class="highlight">2</span> 个课程即将开始</p>
      </div>
      
      <div class="content-container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'TeacherDashboard',
  data() {
    return {
      userName: '张老师',
      userAvatar: require('@/assets/default-avatar.png')
    }
  },
  methods: {
    logout() {
      this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        this.$router.push('/login')
        this.$message.success('已安全退出')
      })
    },
    goProfile() {
      this.$router.push('/teacher/profile')
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 导航栏样式 */
.teacher-header {
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-group h1 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.logo {
  height: 36px;
  filter: brightness(0) invert(1);
}

.teacher-nav {
  display: flex;
  gap: 10px;
  margin-left: 40px;
}

.teacher-nav a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-weight: 500;
  padding: 0 15px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.teacher-nav a:hover {
  color: white;
  background: rgba(255,255,255,0.1);
}

.teacher-nav a.router-link-exact-active {
  color: white;
  background: rgba(255,255,255,0.15);
  border-bottom-color: white;
  font-weight: 600;
}

.teacher-nav i {
  font-size: 18px;
}

.user-actions {
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(255,255,255,0.1);
}

.avatar {
  background-color: #f56a00;
}

.username {
  font-weight: 500;
}

/* 主内容区 */
.teacher-main {
  flex: 1;
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.welcome-banner {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.welcome-banner h2 {
  color: #3a7bd5;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.welcome-banner p {
  color: #666;
  margin: 0;
  font-size: 15px;
}

.highlight {
  color: #f56c6c;
  font-weight: 600;
}

.content-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header-content {
    padding: 0 15px;
  }
  
  .teacher-nav {
    gap: 5px;
    margin-left: 20px;
  }
  
  .teacher-nav a {
    padding: 0 10px;
    font-size: 14px;
  }
  
  .teacher-nav i {
    display: none;
  }
}

@media (max-width: 768px) {
  .teacher-nav span {
    display: none;
  }
  
  .teacher-nav a {
    padding: 0 12px;
  }
  
  .teacher-nav i {
    display: block;
    font-size: 20px;
  }
}
</style>