<template>
  <div class="generate-exam">
    <h2>生成试卷</h2>
    <p>任务编号: {{ taskCode }}</p>
    <p>题库ID: {{ questionBankId || '正在获取...' }}</p>
    
    <div class="info-box">
      <h4>📋 生成说明</h4>
      <p>• 试卷将从当前课程对应的题库中随机选择题目</p>
      <p>• 如果生成失败，可能是题库中的题目数量不足</p>
      <p>• 请确保题库中有足够的各类型题目</p>
      <p>• 点击"检查题库"按钮可以查看当前题库的题目统计</p>
    </div>

    <div class="form-group">
      <label>组卷方式</label>
      <select v-model="examDetails.mode">
        <option value="random">随机</option>
        <option value="difficulty">按难度</option>
        <option value="knowledge">按知识点</option>
      </select>
    </div>

    <div class="form-group">
      <label>选择题题目总数</label>
      <input type="number" v-model.number="examDetails.totalCount" :max="15" min="0" @input="adjustDifficultyDistribution" />
    </div>

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

    <div class="form-group">
      <label>问答题数量（最大不超过5）</label>
      <input type="number" v-model.number="examDetails.essayCount" :max="5" min="0" />
    </div>

    <button class="btn primary-btn" @click="generateExam">生成试卷</button>
    <button class="btn info-btn" @click="checkQuestionBank" style="margin-left: 10px;">检查题库</button>

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
      knowledgePoints: [],
      difficultyLabels: {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      },
      generatedQuestions: [],
      courseId: '',
      taskCode: '',
      questionBankId: ''
    };
  },
  async mounted() {
    this.courseId = this.$route.params.courseId;
    if (!this.courseId) return alert('缺少课程ID');
    await this.fetchCourseDetails();
    await this.fetchKnowledgePoints();
    try {
      const res = await api.get(`/teacher/courses/${this.courseId}/tasks`);
      const tasks = Array.isArray(res) ? res : res.data || [];
      const examTasks = tasks.filter(t => t.type === 'EXAM_QUIZ');
      this.taskCode = `试卷任务-${String(examTasks.length + 1).padStart(3, '0')}`;
    } catch (err) {
      console.error('加载任务编号失败', err);
      alert('任务编号生成失败');
    }
  },
  methods: {
    async fetchCourseDetails() {
      try {
        const res = await api.get(`/teacher/courses/${this.courseId}`);
        const courseData = res.data || res;
        this.questionBankId = courseData.questionBankId || courseData.bankId || `bank_${this.courseId}`;
      } catch (err) {
        console.error('获取课程详情失败', err);
        this.questionBankId = `bank_${this.courseId}`;
        alert('获取课程详情失败，将使用默认题库');
      }
    },
    async fetchKnowledgePoints() {
      try {
        const res = await api.get(`/teacher/courses/${this.courseId}/knowledge-points`);
        this.knowledgePoints = (res.data || []).map(kp => ({
          id: kp.pointId || kp.id,
          name: kp.name
        }));
      } catch (err) {
        console.error('获取知识点失败', err);
      }
    },
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
      if (!this.questionBankId || this.questionBankId.trim() === '') {
        alert('题库ID缺失，请刷新页面重试');
        return;
      }

      const payload = {
        courseId: this.courseId,
        bankId: this.questionBankId,
        mode: this.examDetails.mode,
        totalCount: this.examDetails.totalCount,
        essayCount: this.examDetails.essayCount,
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
        let res = await api.post('/paper/generate', payload);
        const questions = res.data?.questions || res.questions || [];
        const paperId = res.data?.paperId || res.paperId;

        if (!Array.isArray(questions) || questions.length === 0) {
          return alert('试卷生成失败：未获取到题目数据');
        }

        this.generatedQuestions = questions;

        localStorage.setItem('generatedExam', JSON.stringify({
          mode: this.examDetails.mode,
          taskCode: this.taskCode,
          questions,
          questionBankId: this.questionBankId,
          paperId
        }));

        alert('试卷生成成功，将返回任务编辑页面继续填写');
        this.$router.push({
          name: 'AddTask',
          params: { courseId: this.courseId },
          query: { fromExam: 'true' }
        });
      } catch (err) {
        console.error('试卷生成失败', err);
        alert(err.response?.data?.message || err.message || '生成失败');
      }
    },
    async checkQuestionBank() {
      if (!this.questionBankId || this.questionBankId.trim() === '') {
        alert('题库ID缺失，无法检查');
        return;
      }

      try {
        console.log('检查题库:', this.questionBankId);
        
        // 根据后端API路径调用题库信息接口
        const bankInfoRes = await api.get(`/questionBank/${this.questionBankId}/info`);
        console.log('题库基本信息:', bankInfoRes);
        
        // 获取题库中的题目列表来统计数量
        const questionsRes = await api.get(`/questionBank/${this.questionBankId}/question/list`);
        console.log('题目列表:', questionsRes);
        
        const questions = questionsRes || [];
        // 根据数据库表结构，题目类型为：SINGLE, MULTIPLE, JUDGE, FILL, SHORT, OTHER
        const choiceCount = questions.filter(q => q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE' || q.type === 'JUDGE').length;
        const essayCount = questions.filter(q => q.type === 'SHORT_ANSWER' || q.type === 'FILL').length;
        const totalCount = questions.length;
        
        // 处理ApiResponse包装的数据
        const bankInfo = bankInfoRes.data || bankInfoRes;
        const bankName = bankInfo.name || bankInfo.bankName || '未知题库';
        
        let resultMessage = `📊 题库检查结果\n\n`;
        resultMessage += `📚 题库名称：${bankName}\n`;
        resultMessage += `🆔 题库ID：${this.questionBankId}\n\n`;
        resultMessage += `📝 题目统计：\n`;
        resultMessage += `   • 选择题数量：${choiceCount}\n`;
        resultMessage += `   • 问答题数量：${essayCount}\n`;
        resultMessage += `   • 总题目数：${totalCount}\n\n`;
        resultMessage += `⚙️ 当前配置需要：\n`;
        resultMessage += `   • 选择题：${this.examDetails.totalCount}题\n`;
        resultMessage += `   • 问答题：${this.examDetails.essayCount}题\n\n`;
        
        const canGenerate = choiceCount >= this.examDetails.totalCount && essayCount >= this.examDetails.essayCount;
        resultMessage += canGenerate ? 
          '✅ 题库题目数量充足，可以生成试卷！' : 
          '❌ 题库题目数量不足，无法生成试卷！\n\n💡 解决方案：\n1. 减少试卷题目数量\n2. 联系管理员添加更多题目到题库';
        
        alert(resultMessage);
      } catch (err) {
        console.error('检查题库失败', err);
        console.error('错误详情:', err.response);
        
        let errorMsg = '无法检查题库信息';
        if (err.response?.status === 404) {
          errorMsg = `❌ 题库不存在！\n\n🆔 题库ID: ${this.questionBankId}\n\n💡 可能的解决方案：\n1. 联系管理员创建该题库\n2. 确认课程是否正确配置了题库\n3. 检查题库ID是否正确`;
        } else if (err.response?.data?.message) {
          errorMsg = `❌ ${err.response.data.message}`;
        } else if (err.message) {
          errorMsg = `❌ ${err.message}`;
        }
        
        alert(errorMsg);
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

.info-box {
  background: #e8f4fd;
  border-left: 4px solid #4a90e2;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.info-box h4 {
  margin: 0 0 10px 0;
  color: #2c5aa0;
}

.info-box p {
  margin: 5px 0;
  color: #555;
  font-size: 14px;
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
.info-btn {
  background: #17a2b8;
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
