<template>
  <div class="task-detail">
    <h2>{{ task.title }}</h2>
    <p class="deadline">截止时间: {{ task.deadline }}</p>
    <div class="task-content" v-html="task.content"></div>
    
    <div v-if="$route.path.includes('/student/')">
      <h3>提交作业</h3>
      <router-link 
        :to="`/student/homework/${task.id}/submit`"
        class="submit-btn"
      >
        去提交
      </router-link>
    </div>
    
    <div v-else>
      <h3>学生提交情况</h3>
      <p>已提交: {{ task.submittedCount }}/{{ task.totalStudents }}</p>
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
        title: '第一章作业',
        deadline: '2023-12-15',
        content: '<p>完成第一章所有练习题</p><p>阅读第二章内容</p>',
        submittedCount: 15,
        totalStudents: 30
      }
    }
  }
}
</script>

<style scoped>
.task-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.deadline {
  color: #f56c6c;
  font-weight: bold;
}

.task-content {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.submit-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #3a7bd5;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 10px;
}
</style>