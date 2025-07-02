<!-- StudentTask.vue -->
<template>
  <div class="student-task-wrapper">
    <h2>我的课程任务</h2>

    <div v-for="course in enrolledCourses" :key="course.courseId" class="course-section">
      <div class="course-header">
        <h3>{{ course.name }} ({{ course.courseCode }})</h3>
        <p>学期: {{ course.semester }}</p>
      </div>

      <!-- 课程任务 -->
      <div class="tasks-section" v-if="course.tasks?.length">
        <h4>课程任务</h4>
        <table class="task-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>类型</th>
              <th>截止时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in course.tasks" :key="task.taskId">
              <td>{{ task.title }}</td>
              <td>{{ formatTaskType(task.type) }}</td>
              <td>{{ formatDate(task.deadline) }}</td>
              <td :class="getTaskStatusClass(task)">{{ getTaskStatus(task) }}</td>
              <td>
                <button class="btn outline" @click="viewTask(task)">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        暂无任务
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
export default {
  name: 'StudentTask',
  data() {
    return { enrolledCourses: [] }
  },
  methods: {
    viewTask(task) {
      this.$router.push({ name: 'TaskDetail', params: { id: task.taskId } })
    },
    async fetchEnrolledCoursesWithDetails() {
      try {
        const coursesRes = await api.get('/student/courses')
        const courses = coursesRes?.content || []
        this.enrolledCourses = await Promise.all(
          courses.map(async course => {
            try {
              const tasksRes = await api.get(`/student/courses/${course.courseId}/tasks`, {
                params: { page: 1, size: 100 }
              })
              return { ...course, tasks: tasksRes.data || [] }
            } catch (error) {
              console.error(`加载任务失败:`, error)
              return { ...course, tasks: [] }
            }
          })
        )
      } catch (err) {
        console.error('加载课程失败:', err)
        this.showMessage('error', '加载课程数据失败')
      }
    },
    formatTaskType(type) {
      const typeMap = {
        'CHAPTER_HOMEWORK': '章节作业',
        'VIDEO_WATCHING': '视频观看',
        'MATERIAL_READING': '阅读材料',
        'PPT_VIEW': 'PPT浏览'
      }
      return typeMap[type] || type
    },
    formatDate(dateStr) {
      if (!dateStr) return '无截止时间'
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    },
    getTaskStatus(task) {
      if (!task.deadline) return '进行中'
      return new Date() > new Date(task.deadline) ? '已截止' : '进行中'
    },
    getTaskStatusClass(task) {
      return {
        'status-ongoing': this.getTaskStatus(task) === '进行中',
        'status-expired': this.getTaskStatus(task) === '已截止'
      }
    }
  },
  mounted() {
    this.fetchEnrolledCoursesWithDetails()
  }
}


</script>

<style scoped>
.student-task-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.course-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.course-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.resource-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th, .task-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: left;
}

.status-ongoing {
  color: #4CAF50;
}

.status-expired {
  color: #F44336;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #888;
}

.resource-size {
  font-size: 0.8em;
  color: #666;
  margin-left: 8px;
}

.resource-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn.outline {
  background: transparent;
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.btn.primary {
  background: #4a90e2;
  border: none;
  color: white;
}

.btn.outline:hover {
  background: rgba(74, 144, 226, 0.1);
}

@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-actions {
    flex-direction: column;
  }
  
  .task-table {
    display: block;
    overflow-x: auto;
  }
}
.resource-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

</style>