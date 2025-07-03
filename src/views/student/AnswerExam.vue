<template>
  <div class="preview-exam">
    <h2>作答试卷：{{ exam.taskCode }}（{{ modeLabel[exam.mode] || '未知模式' }}）</h2>

    <!-- 客观题 -->
    <div v-if="mcQuestions.length > 0" class="question-section">
      <h3>客观题</h3>
      <div v-for="(q, i) in mcQuestions" :key="'mc-' + i" class="question-item">
        <div class="question-number">{{ i + 1 }}.</div>
        <div class="question-content">
          <p class="question-text">{{ getQuestionText(q) }}</p>
          <div class="options">
            <label
              v-for="(option, optIndex) in getQuestionOptions(q)"
              :key="optIndex"
              class="option"
            >
              <input
                :type="q.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'"
                :name="'mc-' + q.questionId"
                :value="getOptionLabel(optIndex)"
                v-model="answers[q.questionId]"
              />
              {{ getOptionLabel(optIndex) }}. {{ getOptionText(option) }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 主观题 -->
    <div v-if="essayQuestions.length > 0" class="question-section">
      <h3>主观题</h3>
      <div v-for="(q, i) in essayQuestions" :key="'essay-' + i" class="question-item">
        <div class="question-number">{{ i + 1 }}.</div>
        <div class="question-content">
          <p class="question-text">{{ getQuestionText(q) }}</p>
          <textarea
            class="essay-answer"
            v-model="answers[q.questionId]"
            placeholder="请输入你的答案..."
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn secondary-btn" @click="$router.back()">取消</button>
      <button class="btn primary-btn" @click="submitExam">提交试卷</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'AnswerExam',
  data() {
    return {
      exam: { taskCode: '', mode: '', questions: [] },
      modeLabel: {
        random: '随机组卷',
        difficulty: '按难度组卷',
        knowledge: '按知识点组卷'
      },
      answers: {}
    }
  },
  computed: {
    mcQuestions() {
      return this.exam.questions.filter(q =>
        ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'MULTIPLE', 'JUDGE', 'TRUE_FALSE'].includes(
          q.type?.toUpperCase()
        )
      )
    },
    essayQuestions() {
      return this.exam.questions.filter(q =>
        ['FILL', 'FILL_BLANK', 'ESSAY', 'SHORT_ANSWER', 'PROGRAMMING'].includes(
          q.type?.toUpperCase()
        )
      )
    }
  },
  methods: {
    getQuestionText(q) {
      return q.content || q.question || q.stem || q.text || '题目内容缺失'
    },
    getOptionLabel(i) {
      return String.fromCharCode(65 + i)
    },
    getOptionText(opt) {
      return typeof opt === 'string' ? opt : opt.text || opt.content || opt.label || JSON.stringify(opt)
    },
    getQuestionOptions(q) {
      if (Array.isArray(q.options)) return q.options
      if (typeof q.options === 'object') return Object.values(q.options)
      return []
    },
    async submitExam() {
      const taskId = this.$route.params.taskId

      const payload = {
        taskId,
        answerRecordDTO: Object.entries(this.answers).map(([questionId, ans]) => ({
          questionId,
          answers: Array.isArray(ans) ? ans : [ans]
        }))
      }

      try {
        await api.post('/submissions/submit/answers', payload)
        this.$message?.success('提交成功') || alert('提交成功')
        this.$router.push('/student')
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || '提交失败'
        this.$message?.error(msg) || alert(msg)
      }
    }
  },
  async mounted() {
    const taskId = this.$route.params.taskId
    try {
      const paperRes = await api.get(`/paper/task/${taskId}`)
      const paper = paperRes.data || paperRes

      const paperId = paper.paperId
      const detailRes = await api.get(`/paper/${paperId}/questions`)
      const detail = detailRes.data || detailRes

      this.exam = {
        taskCode: paper.title || '试卷',
        mode: (paper.generationMethod || 'random').toLowerCase(),
        questions: detail.questions || []
      }
    } catch (e) {
      console.error('加载试卷失败', e)
      this.$message?.error('试卷加载失败') || alert('试卷加载失败')
    }
  }
}
</script>

<style scoped>
@import './PreviewExam.css';

.essay-answer {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
