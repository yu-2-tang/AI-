<template>
  <div class="generate-exam">
    <h2>生成试卷</h2>
    <p>任务编号: {{ taskCode }}</p>

    <!-- 组卷方式 -->
    <div class="form-group">
      <label>组卷方式</label>
      <select v-model="examDetails.mode">
        <option value="random">随机</option>
        <option value="difficulty">按难度</option>
        <option value="knowledge">按知识点</option>
      </select>
    </div>

    <!-- 选择题题目总数 -->
    <div class="form-group">
      <label>选择题题目总数</label>
      <input type="number" v-model.number="examDetails.totalCount" :max="15" min="0" @input="adjustDifficultyDistribution" />
    </div>

    <!-- 难度设置 -->
    <div v-if="examDetails.mode === 'difficulty'" class="form-group">
      <label>难度分布（每项最多5题，总和等于选择题题数）</label>
      <div class="difficulty-row" v-for="(label, key) in difficultyLabels" :key="key">
        <label>{{ label }}：</label>
        <input
          type="number"
          v-model.number="examDetails.difficulty[key]"
          :max="5"
          min="0"
          @input="onDifficultyChange(key)"
        />
      </div>
    </div>

    <!-- 知识点选择 -->
    <div v-if="examDetails.mode === 'knowledge'" class="form-group">
      <label>选择题知识点（可多选）</label>
      <div>
        <label v-for="kp in knowledgePoints" :key="kp.id" style="margin-right: 15px;">
          <input
            type="checkbox"
            :value="kp.id"
            v-model="examDetails.knowledgePointIds"
            @change="updateKnowledgeBasedTotal"
          />
          {{ kp.name }}
        </label>
      </div>
    </div>

    <!-- 问答题数量 -->
    <div class="form-group">
      <label>问答题数量（最大不超过5）</label>
      <input type="number" v-model.number="examDetails.essayCount" :max="5" min="0" />
    </div>

    <button class="btn primary-btn" @click="generateExam">生成试卷</button>

    <div v-if="generatedQuestions.length > 0">
      <h3>预览试卷</h3>
      <p>组卷方式: {{ examDetails.mode }}</p>
      <p>题目总数: {{ generatedQuestions.length }}</p>
      <ul>
        <li v-for="(q, index) in generatedQuestions" :key="index">
          <strong>{{ index + 1 }}.</strong> {{ q.content || q.questionId }}
        </li>
      </ul>
      <button class="btn secondary-btn" @click="goToPreview">预览所有题目</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'GenerateExam',
  data() {
    return {
      examDetails: {
        mode: 'random',
        totalCount: 5,
        essayCount: 0,
        difficulty: { easy: 2, medium: 2, hard: 1 },
        knowledgePointIds: []
      },
      knowledgePoints: [
        { id: 'kp1', name: '插值法' },
        { id: 'kp2', name: '误差分析' },
        { id: 'kp3', name: '数值积分' }
      ],
      difficultyLabels: {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      },
      generatedQuestions: [],
      courseId: '',
      taskCode: ''
    };
  },
  async mounted() {
    this.courseId = this.$route.params.courseId;
    if (!this.courseId) return alert('缺少课程ID');
    try {
      const res = await api.get(`/teacher/courses/${this.courseId}/tasks`);
      const tasks = Array.isArray(res) ? res : res.data || [];
      const examTasks = tasks.filter(t => t.type === 'EXAM_QUIZ');
      const newIndex = examTasks.length + 1;
      this.taskCode = `试卷任务-${String(newIndex).padStart(3, '0')}`;
    } catch (err) {
      console.error('加载任务编号失败', err);
      alert('任务编号生成失败');
    }
  },
  methods: {
    onDifficultyChange(changedKey) {
      const d = this.examDetails.difficulty;
      const total = this.examDetails.totalCount;
      const keys = ['easy', 'medium', 'hard'];
      let sum = d.easy + d.medium + d.hard;

      if (sum > total) {
        let excess = sum - total;
        for (let k of keys) {
          if (k !== changedKey && d[k] > 0) {
            let reducible = Math.min(d[k], excess);
            d[k] -= reducible;
            excess -= reducible;
            if (excess === 0) break;
          }
        }
      }

      // 限制每项最大为5
      keys.forEach(k => {
        if (d[k] > 5) d[k] = 5;
        if (d[k] < 0) d[k] = 0;
      });

      this.syncTotalFromDifficulty();
    },
    adjustDifficultyDistribution() {
      const total = this.examDetails.totalCount;
      const d = this.examDetails.difficulty;

      d.easy = Math.min(total, 5);
      d.medium = Math.min(Math.max(total - d.easy, 0), 5);
      d.hard = Math.max(total - d.easy - d.medium, 0);

      this.syncTotalFromDifficulty();
    },
    syncTotalFromDifficulty() {
      const d = this.examDetails.difficulty;
      this.examDetails.totalCount = d.easy + d.medium + d.hard;
    },
    updateKnowledgeBasedTotal() {
      const count = this.examDetails.knowledgePointIds.length * 5;
      this.examDetails.totalCount = Math.min(count, 15);
    },
    async generateExam() {
  const payload = {
    courseId: this.courseId,
    mode: this.examDetails.mode,
    totalCount: this.examDetails.totalCount,
    essayCount: this.examDetails.essayCount
  };

  if (this.examDetails.mode === 'difficulty') {
    payload.difficultyDistribution = this.examDetails.difficulty;
  }

  if (this.examDetails.mode === 'knowledge') {
    if (this.examDetails.knowledgePointIds.length === 0) {
      return alert('请选择知识点');
    }
    payload.knowledgePointIds = this.examDetails.knowledgePointIds;
  }

  try {
    const res = await api.post('/paper/generate', payload);
    if (!res || !Array.isArray(res.questions)) {
      return alert('试卷生成失败');
    }

    this.generatedQuestions = res.questions;

    localStorage.setItem('generatedExam', JSON.stringify({
      mode: this.examDetails.mode,
      taskCode: this.taskCode,
      questions: res.questions
    }));

    alert('试卷生成成功，将返回任务编辑页面继续填写');
    this.$router.back(); // 或 this.$router.push({ name: 'AddTask', params: { courseId: this.courseId } });
  } catch (err) {
    console.error('试卷生成失败', err);
    alert(err.message || '生成失败');
  }
},
    goToPreview() {
      this.$router.push({ name: 'PreviewExam', params: { courseId: this.courseId } });
    }
  }
};
</script>

<style scoped>
.generate-exam {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
}
input, select {
  width: 100%;
  margin: 5px 0;
  padding: 8px;
}
.difficulty-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.difficulty-row label {
  width: 60px;
}
.difficulty-row input {
  flex: 1;
}
.btn {
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 10px;
}
.primary-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
}
.secondary-btn {
  background: #6c757d;
  color: #fff;
  border: none;
  margin-left: 10px;
}
</style>
