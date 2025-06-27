<template>
  <div class="generate-exam">
    <h2>生成试卷</h2>
    
    <!-- 显示任务ID -->
    <p>任务ID: {{ $route.params.id }}</p>

    <!-- 选择题类型 -->
    <div class="form-group">
      <label>选择题类型</label>
      <select v-model="examDetails.type">
        <option value="MULTIPLE_CHOICE">选择题</option>
        <option value="ESSAY">问答题</option>
      </select>
    </div>

    <!-- 选择题目 -->
    <div class="form-group">
      <label>选择题目</label>
      <input v-model="examDetails.questions" placeholder="选择题内容" />
    </div>

    <!-- 题目描述 -->
    <div class="form-group">
      <label>题目描述</label>
      <textarea v-model="examDetails.description" placeholder="题目描述"></textarea>
    </div>

    <!-- 题目分数 -->
    <div class="form-group">
      <label>分数</label>
      <input v-model.number="examDetails.score" placeholder="分数" type="number" />
    </div>

    <!-- 生成试卷按钮 -->
    <button @click="generateExam" class="btn primary-btn">生成试卷</button>

    <!-- 预览试卷 -->
    <div v-if="generatedExam">
      <h3>预览试卷</h3>
      <p>试卷类型: {{ generatedExam.type }}</p>
      <p>题目: {{ generatedExam.questions }}</p>
      <p>描述: {{ generatedExam.description }}</p>
      <p>分数: {{ generatedExam.score }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GenerateExam',
  data() {
    return {
      examDetails: {
        type: 'MULTIPLE_CHOICE',
        questions: '',
        description: '',
        score: 0
      },
      generatedExam: null  // 用于存储生成的试卷
    };
  },
  methods: {
    generateExam() {
      this.generatedExam = { ...this.examDetails };  // 将组卷信息存储
      console.log('生成的试卷:', this.generatedExam);
    }
  },
  mounted() {
    console.log('生成试卷页面，任务ID:', this.$route.params.id);  // 打印任务ID
  }
}
</script>

<style scoped>
/* 整体容器样式 */
.generate-exam {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 表单项样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.primary-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #357ab7;
}

/* 预览试卷区域 */
h3 {
  margin-top: 20px;
  font-size: 1.5rem;
}

p {
  font-size: 1rem;
  margin-bottom: 5px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .generate-exam {
    padding: 15px;
  }
}
</style>
