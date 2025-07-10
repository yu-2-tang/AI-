<template>
  <div class="student-course-wrapper">
    <h2>课程中心</h2>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input v-model="keyword" placeholder="按课程名称或编号搜索" />
      <button class="btn primary" @click="fetchAllCourses">搜索课程</button>
    </div>

    <!-- 全部课程 -->
    <h3>可选课程</h3>
    <div class="course-grid">
      <div v-for="course in allCourses" :key="course.courseId" class="course-card">
        <h4>{{ course.name }}</h4>
        <p>编号: {{ course.courseCode }}</p>
        <p>学期: {{ course.semester }}</p>
        <p>学分: {{ course.credit }}，学时: {{ course.hours }}</p>
        <button class="btn primary" @click="enrollCourse(course.courseId)">选课</button>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1" class="pagination-btn">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="page >= totalPages" class="pagination-btn">下一页</button>
    </div>

    <!-- 我已选课程 -->
    <h3>我已选课程</h3>
    <div class="course-grid">
      <div v-for="course in myCourses" :key="course.courseId" class="course-card enrolled">
        <h4>{{ course.name }}</h4>
        <p>编号: {{ course.courseCode }}</p>
        <p>学期: {{ course.semester }}</p>
        <p>学分: {{ course.credit }}，学时: {{ course.hours }}</p>
        <div class="button-group">
          <button class="btn danger" @click="dropCourse(course.courseId)">退课</button>
          <button class="btn primary" @click="goToCourseDetail(course.courseId)">课程详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'StudentCourse',
  data() {
    return {
      allCourses: [],
      myCourses: [],
      keyword: '',
      semester: '',
      page: 1,
      size: 8,
      totalPages: 1
    }
  },
  methods: {
    async fetchAllCourses() {
      try {
        const res = await api.get('/student/courses/search', {
          params: {
            page: this.page,
            size: this.size,
            keyword: this.keyword
          }
        })
        this.allCourses = res?.content || []
        this.totalPages = res?.totalPages || 1
      } catch (err) {
        console.error('获取课程失败', err)
      }
    },

    async fetchMyCourses() {
      try {
        const res = await api.get('/student/courses', {
          params: { page: 1, size: 20 }
        })
        this.myCourses = res?.content || []
      } catch (err) {
        console.error('获取我已选课程失败', err)
      }
    },

    async enrollCourse(courseId) {
      try {
        await api.post(`/student/courses/${courseId}/enroll`)
        alert('选课成功')
        this.fetchMyCourses()
      } catch (err) {
        alert(err.response?.data?.message || '选课失败')
      }
    },

    async dropCourse(courseId) {
      if (!confirm('确认要退选这门课程吗？')) return
      try {
        await api.post(`/student/courses/${courseId}/drop`)
        alert('退课成功')
        this.fetchMyCourses()
      } catch (err) {
        alert(err.response?.data?.message || '退课失败')
      }
    },

    goToCourseDetail(courseId) {
      this.$router.push({
        name: 'CourseDetail',
        params: { id: courseId }
      })
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++
        this.fetchAllCourses()
      }
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.fetchAllCourses()
      }
    }
  },
  mounted() {
    this.fetchAllCourses()
    this.fetchMyCourses()
  }
}
</script>

<style scoped>
.student-course-wrapper {
  padding: 20px;
}
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}
.course-card {
  background: #fff;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
}
.course-card.enrolled {
  border-left: 4px solid #4a90e2;
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn.primary {
  background: #4a90e2;
  color: white;
}
.btn.danger {
  background: #e74c3c;
  color: white;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
button {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

</style>
