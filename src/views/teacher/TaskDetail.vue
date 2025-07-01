<template>
  <div class="task-detail">
    <!-- 加载中 -->
    <div v-if="isLoading">加载中...</div>

    <!-- 显示任务详情 -->
    <div v-else-if="task">
      <h2>{{ task.title }} - 任务详情</h2>

      <div class="task-info">
        <p><strong>任务类型:</strong> {{ displayTaskType(task.type) }}</p>
        <p><strong>截止时间:</strong> {{ task.deadline }}</p>
        <p><strong>任务描述:</strong> {{ task.description }}</p>
      </div>

      <!-- 试卷答题任务才显示“开始答题”按钮 -->
      <div v-if="task.type === 'EXAM_QUIZ'">
        <button class="btn primary-btn" @click="startExam">开始答题</button>
      </div>
    </div>

    <!-- 任务未找到 -->
    <div v-else>
      <p>未找到该任务，请检查链接是否正确。</p>
    </div>
  </div>
</template>

<script>
import axios from '@/axios';

export default {
  name: 'TaskDetail',
  props: ['id'],
  data() {
    return {
      task: null,
      isLoading: true
    };
  },
  methods: {
    async fetchTask() {
      try {
        const res = await axios.get(`/teacher/tasks/${this.id}`);
        this.task = res.data; // 注意：你接口使用 ApiResponse 包装，数据在 .data.data 中
      } catch (err) {
        console.error('加载任务失败', err);
        alert(err.response?.data?.message || '加载任务失败');
      } finally {
        this.isLoading = false;
      }
    },
    displayTaskType(type) {
      const map = {
        CHAPTER_HOMEWORK: '章节作业',
        VIDEO_WATCHING: '视频观看',
        MATERIAL_READING: '阅读材料',
        PPT_VIEW: 'PPT浏览',
        REPORT_SUBMISSION: '报告上传',
        EXAM_QUIZ: '试卷答题'
      };
      return map[type] || type;
    },
    startExam() {
      console.log('开始考试');
      // 后续可跳转考试答题页面
    }
  },
  mounted() {
    this.fetchTask();
  }
}
</script>

<style scoped>
.task-detail {
  padding: 20px;
}
.task-info {
  margin-bottom: 20px;
}
button {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #357ab7;
}
</style>
