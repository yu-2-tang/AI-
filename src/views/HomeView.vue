<template>
  <div class="home-page">
    <AppHeader />
    
    <main>
      <!-- 修改的主视觉区域 -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content-wrapper">
            <div class="hero-content">
              <h2>AI赋能教育，知识图谱引领学习革命</h2>
              <p class="subtitle">智能化生产 · 结构化管理 · 个性化学习</p>
              <div class="cta-buttons">
                <button class="btn primary-btn" @click="navigateToLogin">立即体验</button>
                <button class="btn secondary-btn" @click="showDemo">观看演示</button>
              </div>
            </div>
            <div class="hero-image">
              <img src="@/assets/hero-graph.png" alt="知识图谱示例">
            </div>
          </div>
        </div>
      </section>

      <!-- 功能介绍区 -->
      <section class="features-section">
        <div class="container">
          <h3 class="section-title">核心功能</h3>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-graph"></i>
              </div>
              <h4>智能知识图谱</h4>
              <p>自动构建课程知识体系，可视化展示知识点关联关系，支持个性化学习路径推荐</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-task"></i>
              </div>
              <h4>多元化任务管理</h4>
              <p>支持章节作业、视频学习、测试答题等多种任务类型，全面记录学习过程数据</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-analytics"></i>
              </div>
              <h4>学情智能分析</h4>
              <p>基于AI的学习行为分析，提供精准的能力评估和个性化的学习建议</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户类型展示 -->
      <section class="user-types-section">
        <div class="container">
          <h3 class="section-title">服务于</h3>
          <div class="user-types">
            <div class="user-type teacher">
              <h4>高校教师</h4>
              <ul>
                <li>智能课程管理</li>
                <li>学情实时监控</li>
                <li>AI辅助评估</li>
              </ul>
            </div>
            <div class="user-type student">
              <h4>大学生</h4>
              <ul>
                <li>个性化学习路径</li>
                <li>智能知识推荐</li>
                <li>能力成长追踪</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  components: {
    AppHeader,
    AppFooter
  },
  methods: {
    navigateToLogin() {
      this.$router.push('/login');
    },
    showDemo() {
      alert('即将播放平台演示视频');
    }
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  margin-top: 70px; /* 为固定导航栏留出空间 */
}

/* 修改的主视觉区域样式 */
.hero-section {
  background: linear-gradient(135deg, #f0f8ff 0%, #c7e0ff 100%);
  color: #2c3e50;
  padding: 80px 0;
}

.hero-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  width: 50%;
  padding-right: 80px;
}

.hero-content h2 {
  font-size: 36px;
  margin-bottom: 20px;
  line-height: 1.3;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #3a7bd5;
  transform: translateY(-2px);
}

.secondary-btn {
  background-color: transparent;
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.secondary-btn:hover {
  background-color: rgba(74, 144, 226, 0.1);
  transform: translateY(-2px);
}

.hero-image {
  width: 50%;
  margin-left: -40px;
}

.hero-image img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* 以下保持原有样式不变 */
.features-section {
  padding: 80px 0;
  background-color: #f9f9f9;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 50px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
}

.feature-card h4 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.user-types-section {
  padding: 80px 0;
}

.user-types {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.user-type {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.user-type h4 {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid;
}

.user-type.teacher h4 {
  color: #3a7bd5;
  border-bottom-color: #3a7bd5;
}

.user-type.student h4 {
  color: #00c853;
  border-bottom-color: #00c853;
}

.user-type ul {
  list-style-type: none;
  padding: 0;
}

.user-type li {
  padding: 8px 0;
  color: #666;
  position: relative;
  padding-left: 25px;
}

.user-type li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: inherit;
  font-size: 20px;
}
</style>