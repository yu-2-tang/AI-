<template>
  <div class="course-mgmt">
    <h2>课程信息管理</h2>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="btn primary-btn" @click="addCourse">新增课程</button>
    </div>

    <!-- 表格组件 -->
    <CourseTable
      :courses="courses"
      @edit="editCourse"
      @delete="deleteCourse"
    />

    <!-- 弹窗组件 -->
    <CourseForm
      :visible="showForm"
      :course="editingCourse"
      @submit="submitForm"
      @cancel="showForm = false"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CourseTable from './components/CourseTable.vue'
import CourseForm from './components/CourseForm.vue'

export default {
  name: 'CourseManagement',
  components: {
    CourseTable,
    CourseForm
  },
  data() {
    return {
      courses: [],
      showForm: false,
      editingCourse: null
    }
  },
  methods: {
    async fetchCourses() {
      try {
        const res = await axios.get('/api/teacher/courses', {
          headers: { Authorization: `Bearer ${localStorage.token}` }
        })
        this.courses = res.data.data || []
      } catch (err) {
        console.error('课程列表获取失败', err)
      }
    },
    addCourse() {
      this.editingCourse = null
      this.showForm = true
    },
    editCourse(course) {
      this.editingCourse = course
      this.showForm = true
    },
    async deleteCourse(courseId) {
      if (!confirm('确认删除该课程？')) return
      try {
        await axios.delete(`/api/teacher/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.token}` }
        })
        this.fetchCourses()
      } catch (err) {
        console.error('删除失败', err)
        alert('删除失败，可能存在关联数据。')
      }
    },
    async submitForm(courseData) {
      const isEdit = !!courseData.courseId
      const url = isEdit
        ? `/api/teacher/courses/${courseData.courseId}`
        : '/api/teacher/courses'

      const method = isEdit ? 'put' : 'post'

      try {
        await axios[method](url, courseData, {
          headers: { Authorization: `Bearer ${localStorage.token}` }
        })
        this.showForm = false
        this.fetchCourses()
      } catch (err) {
        console.error('保存失败', err)
        alert('保存失败，请检查输入')
      }
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.course-mgmt {
  padding: 20px;
}

.action-bar {
  margin-bottom: 15px;
}

/* 按钮样式 */
.btn {
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.25s;
}
.primary-btn {
  background: #4a90e2;
  color: #fff;
}
.primary-btn:hover {
  opacity: 0.9;
}
</style>
