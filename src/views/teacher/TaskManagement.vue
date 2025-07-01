<template>
  <div class="teacher-tasks">
    <h2>我的课程及任务</h2>

    <div v-for="course in courses" :key="course.courseId" class="course-card">
      <h3>{{ course.name }} ({{ course.courseCode }})</h3>
      <p>学期: {{ course.semester }}</p>

      <button class="primary-btn" @click="goToAddTask(course.courseId)">发布任务</button>

      <div v-if="course.tasks.length">
        <h4>已发布任务</h4>
        <table class="task-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>类型</th>
              <th>截止时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in course.tasks" :key="task.taskId">
              <td>{{ task.title }}</td>
              <td>{{ task.type }}</td>
              <td>{{ task.deadline }}</td>
              <td>
                <button class="outline-btn" @click="viewTask(task.taskId)">查看</button>
                <button class="danger-btn" @click="deleteTask(course.courseId, task.taskId)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>暂无任务</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'TeacherTaskManagement',
  data() {
    return {
      courses: []
    }
  },
  methods: {
    async fetchCoursesAndTasks() {
      try {
        const res = await axios.get('/teacher/courses')
        const courses = res.data || []

        // 为每门课程加载任务
        const courseTasksPromises = courses.map(async course => {
          const taskRes = await axios.get(`/teacher/courses/${course.courseId}/tasks`)
          return {
            ...course,
            tasks: taskRes.data || []
          }
        })

        this.courses = await Promise.all(courseTasksPromises)
      } catch (err) {
        console.error('加载课程或任务失败', err)
        alert(err.response?.data?.message || '加载失败')
      }
    },
    goToAddTask(courseId) {
      this.$router.push({ name: 'AddTask', params: { courseId } })
    },
    viewTask(taskId) {
      this.$router.push({ name: 'TaskDetail', params: { id: taskId } })
    },
    async deleteTask(courseId, taskId) {
      if (!confirm('确定要删除这个任务吗？')) return
      try {
        await axios.delete(`/teacher/tasks/${taskId}`)
        alert('任务删除成功')
        this.fetchCoursesAndTasks()
      } catch (err) {
        console.error('任务删除失败', err)
        alert(err.response?.data?.message || '删除失败')
      }
    }
  },
  mounted() {
    this.fetchCoursesAndTasks()
  }
}
</script>

<style scoped>
.teacher-tasks {
  padding: 20px;
}
.course-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.primary-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
}
.task-table th, .task-table td {
  border: 1px solid #eee;
  padding: 8px;
}
.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.outline-btn {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
