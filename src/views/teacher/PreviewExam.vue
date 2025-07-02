<template>
  <div class="preview-exam">
    <h2>试卷预览：{{ exam.taskCode }}（{{ modeLabel[exam.mode] || '未知模式' }}）</h2>

    <h3>选择题</h3>
    <ul v-if="mcQuestions.length > 0">
      <li v-for="(q, i) in mcQuestions" :key="i">
        {{ i + 1 }}. {{ q.content }}
      </li>
    </ul>
    <p v-else>暂无选择题</p>

    <h3>问答题</h3>
    <ul v-if="essayQuestions.length > 0">
      <li v-for="(q, i) in essayQuestions" :key="i">
        {{ i + 1 }}. {{ q.content }}
      </li>
    </ul>
    <p v-else>暂无问答题</p>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'PreviewExam',
  data() {
    return {
      exam: {
        taskCode: '',
        mode: '',
        questions: []
      },
      modeLabel: {
        random: '随机组卷',
        difficulty: '按难度组卷',
        knowledge: '按知识点组卷'
      }
    };
  },
  computed: {
    mcQuestions() {
      return this.exam.questions.filter(q =>
        ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'JUDGE'].includes(q.type?.toUpperCase())
      );
    },
    essayQuestions() {
      return this.exam.questions.filter(q =>
        ['FILL_BLANK', 'SHORT_ANSWER', 'PROGRAMMING'].includes(q.type?.toUpperCase())
      );
    }
  },
  async mounted() {
    const route = this.$route;
    const taskId = route.params.id;
    const paperId = route.query.paperId;

    if (taskId === 'temp-preview') {
      const saved = localStorage.getItem('generatedExam');
      if (!saved) {
        alert('暂无预览试卷');
        this.$router.back();
        return;
      }
      try {
        const data = JSON.parse(saved);
        this.exam = {
          taskCode: data.taskCode || '未命名试卷',
          mode: data.mode || 'random',
          questions: data.questions || []
        };
      } catch (err) {
        console.error('解析本地试卷失败', err);
        alert('无法预览试卷');
        this.$router.back();
      }
      return;
    }

    if (paperId) {
      try {
        const res = await api.get(`/paper/${paperId}`);
        const paper = res?.data || res || res;
        if (!paper) {
          alert('试卷不存在或加载失败');
          return;
        }
        this.exam = {
          taskCode: paper.title || paper.paperId,
          mode: (paper.generationMethod || 'random').toLowerCase(),
          questions: paper.questions || []
        };
      } catch (err) {
        console.error('加载试卷失败', err);
        alert('加载失败：' + (err.response?.data?.message || err.message));
      }
      return;
    }

    alert('缺少 paperId，无法加载试卷');
    this.$router.back();
  }
};
</script>


<style scoped>
.preview-exam {
  padding: 30px;
  max-width: 900px;
  margin: auto;
}
h2 {
  font-size: 24px;
  margin-bottom: 20px;
}
h3 {
  margin-top: 20px;
  color: #333;
}
ul {
  list-style: decimal inside;
  padding-left: 20px;
}
li {
  margin: 5px 0;
}
</style>
