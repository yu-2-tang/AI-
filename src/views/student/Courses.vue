<template>
  <div class="student-courses">
    <h2>我的课程</h2>
    <div class="course-list">
      <div class="course-card" v-for="course in courses" :key="course.id">
        <h3>{{ course.name }}</h3>
        <p>教师: {{ course.teacher }}</p>
        <p>时间: {{ course.time }}</p>
        <p>地点: {{ course.location }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentCourses',
  data() {
    return {
      courses: [
        {
          id: 1,
          name: '计算机科学导论',
          teacher: '张教授',
          time: '周一 8:00-10:00',
          location: '教学楼A201'
        },
        {
          id: 2,
          name: '数据结构与算法',
          teacher: '李教授',
          time: '周三 10:00-12:00',
          location: '教学楼B305'
        }
      ]
    }
  }
}
</script>

<style scoped>
.student-courses {
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
</style>