<template>
  <div class="course-detail">
    <h2>{{ course.name }}</h2>
    <p>课程编号: {{ course.courseCode }}</p>
    <p>学分: {{ course.credit }}</p>
    <p>学时: {{ course.hours }}</p>
    <p>学期: {{ course.semester }}</p>
    <p>描述: {{ course.description }}</p>
    <p>学生人数: {{ course.studentCount }}</p>
    <p>任务数量: {{ course.taskCount }}</p>

    <div class="actions">
      <!-- 仅展示课程信息，不进行编辑和删除 -->
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'CourseDetail',
  data() {
    return {
      courseId: this.$route.params.id,
      course: {}
    }
  },
  methods: {
    async fetchCourseDetail() {
      try {
        const res = await axios.get(`/teacher/courses/${this.courseId}`)
        this.course = res.data || {}
      } catch (err) {
        console.error('获取课程详情失败', err)
        alert(err.response?.data?.message || '加载课程详情失败')
      }
    }
  },
  mounted() {
    this.fetchCourseDetail()
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}
</style>
