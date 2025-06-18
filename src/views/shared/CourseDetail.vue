<template>
  <div class="course-detail">
    <h2>{{ course.name }}</h2>
    <p>课程编号: {{ course.code }}</p>
    <p>授课教师: {{ course.teacher }}</p>
    <p>学分: {{ course.credit }}</p>
    <p>学时: {{ course.hours }}</p>
    <p>描述: {{ course.description }}</p>
  </div>
</template>

<script>
export default {
  name: 'CourseDetail',
  data() {
    return {
      course: {
        id: this.$route.params.id,
        name: '计算机科学导论',
        code: 'CS101',
        teacher: '张教授',
        credit: 3,
        hours: 48,
        description: '计算机科学基础课程'
      }
    }
  }
}
</script>