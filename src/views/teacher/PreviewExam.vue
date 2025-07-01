<template>
  <div class="preview-exam">
    <h2>试卷预览：{{ exam.taskCode }}（{{ modeLabel[exam.mode] }}）</h2>

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
        ['SINGLE', 'MULTIPLE'].includes(q.type?.toUpperCase())
      );
    },
    essayQuestions() {
      return this.exam.questions.filter(q =>
        ['SHORT', 'ESSAY'].includes(q.type?.toUpperCase())
      );
    }
  },
  async mounted() {
  const taskId = this.$route.params.id;

  // 临时预览试卷逻辑
  if (taskId === 'temp-preview') {
    const saved = localStorage.getItem('generatedExam');
    if (!saved) {
      alert('暂无预览试卷');
      this.$router.back();
      return;
    }

    const data = JSON.parse(saved);
    this.exam = {
      taskCode: data.taskCode || '未命名试卷',
      mode: data.mode,
      questions: data.questions || []
    };
    return;
  }

  // 正常加载已发布任务的试卷逻辑
  try {
    const res = await api.get(`/teacher/tasks/${taskId}`);
    const task = res?.data;
    if (!task) {
      alert('未找到任务详情');
      return;
    }

    this.exam = {
      taskCode: task.title || task.taskId,
      mode: task.mode || 'random',
      questions: task.questions || []
    };
  } catch (err) {
    console.error('加载任务失败', err);
    alert('加载失败');
  }
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
