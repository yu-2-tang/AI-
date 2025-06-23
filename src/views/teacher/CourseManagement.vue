<template>
  <div class="course-mgmt">
    <h2>课程管理</h2>
    <div class="action-bar">
      <button class="btn primary-btn" @click="addCourse">新增课程</button>
    </div>
    <CourseTable :courses="courses" @edit="editCourse" @delete="deleteCourse" />
    <CourseForm :visible="showForm" :course="editingCourse" @submit="submitForm" @cancel="showForm = false" />
  </div>
</template>

<script>
import axios from '@/axios'
import CourseTable from '@/views/teacher/components/CourseTable.vue'
import CourseForm from '@/views/teacher/components/CourseForm.vue'


export default {
  name: 'CourseManagement',
  components: { CourseTable, CourseForm },
  data() {
    return {
      courses: [], showForm: false, editingCourse: null
    }
  },
  methods: {
    async fetchCourses() {
      const res = await axios.get('/api/course/list-teacher', {
        headers: { Authorization: `Bearer ${localStorage.token}` }
      })
      this.courses = res.data.data || []
    },
    addCourse() {
      this.editingCourse = null; this.showForm = true
    },
    editCourse(course) {
      this.editingCourse = course; this.showForm = true
    },
    async deleteCourse(courseId) {
      if (!confirm('确认删除？')) return
      await axios.delete(`/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.token}` }
      })
      this.fetchCourses()
    },
    async submitForm(courseData) {
      const method = courseData.id ? 'put' : 'post'
      const url = courseData.id ? `/api/course/update` : '/api/course/add'
      await axios[method](url, courseData, {
        headers: { Authorization: `Bearer ${localStorage.token}` }
      })
      this.showForm = false
      this.fetchCourses()
    }
  },
  mounted() { this.fetchCourses() }
}
</script>
