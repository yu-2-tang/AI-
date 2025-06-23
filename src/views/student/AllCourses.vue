<template>
  <div class="all-courses">
    <h2>全部课程列表</h2>
    <div class="course-list">
      <div class="course-card" v-for="course in courses" :key="course.id">
        <h3>{{ course.name }}</h3>
        <p>教师: {{ course.teacher }}</p>
        <p>学期: {{ course.semester }}</p>
        <p>学分: {{ course.credit }}</p>
        <p>学时: {{ course.hours }}</p>
        <button class="btn primary-btn" @click="selectCourse(course.id)">选课</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'AllCourses',
  data() {
    return {
      courses: []
    }
  },
  methods: {
    async fetchCourses() {
      try {
        const res = await axios.get('/api/course/list-all')
        this.courses = res.data.data || []
      } catch (err) {
        console.error('加载课程失败', err)
        alert('加载课程失败')
      }
    },
    async selectCourse(courseId) {
      try {
        await axios.post(`/api/course/select/${courseId}`)
        alert('选课成功')
        this.fetchCourses()
      } catch (err) {
        console.error('选课失败', err)
        alert(err.response?.data?.msg || '选课失败')
      }
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.all-courses {
  padding: 20px;
}
.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.course-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.btn {
  margin-top: 10px;
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.primary-btn {
  background: #4a90e2;
  color: white;
}
.primary-btn:hover {
  opacity: 0.9;
}
</style>
