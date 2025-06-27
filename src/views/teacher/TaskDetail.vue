<template>
  <div class="task-detail">
    <h2>{{ task.title }} - 任务详情</h2>

    <div class="task-info">
      <p><strong>任务类型:</strong> {{ task.type }}</p>
      <p><strong>截止时间:</strong> {{ task.deadline }}</p>
      <p><strong>任务描述:</strong> {{ task.description }}</p>
    </div>
    
    <div v-if="task.type === 'EXAM_QUIZ'">
      <button class="btn primary-btn" @click="startExam">开始答题</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskDetail',
  data() {
    return {
      task: {
        id: this.$route.params.id,
        title: '期中测试',
        type: '试卷答题',
        deadline: '2025-07-15',
        description: '完成期中测试，提交答卷。',
      },
    };
  },
  methods: {
    startExam() {
      console.log('开始考试');
    }
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
</style>
