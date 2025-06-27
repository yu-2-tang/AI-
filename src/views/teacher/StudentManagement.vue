<template>
  <div class="student-mgmt">
    <h2>课程学生管理</h2>

    <div class="course-list">
      <div
        v-for="course in paginatedCourses"
        :key="course.courseId"
        class="course-card"
      >
        <h3>{{ course.name }}</h3>
        <p>课程代码：{{ course.courseCode }}</p>
        <p>学期：{{ course.semester }}</p>

        <div class="action-bar">
          <input
            type="file"
            accept=".csv,.xlsx"
            :ref="`fileInput-${course.courseId}`"
            hidden
            @change="(e) => importStudents(e, course.courseId)"
          />
          <button class="btn import-btn" @click="triggerFile(course.courseId)">导入学生</button>
          <button class="btn view-btn" @click="goToStudentList(course.courseId)">查看学生</button>
        </div>
      </div>
    </div>

   <!-- 分页控制 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1" class="pagination-btn">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="page >= totalPages" class="pagination-btn">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from '@/axios';

export default {
  name: 'StudentManagement',
  data() {
    return {
      courses: [],
      page: 1,
      size: 6
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.courses.length / this.size) || 1;
    },
    paginatedCourses() {
      const start = (this.page - 1) * this.size;
      return this.courses.slice(start, start + this.size);
    }
  },
  async mounted() {
    try {
      const res = await axios.get('/teacher/courses');
      this.courses = res.data || [];
    } catch (err) {
      console.error('获取课程失败', err);
      alert('加载课程失败');
    }
  },
  methods: {
    triggerFile(courseId) {
      const input = this.$refs[`fileInput-${courseId}`];
      if (input && input.click) {
        input.click();
      } else if (Array.isArray(input)) {
        input[0]?.click();
      } else {
        console.warn('input not found for', courseId, input);
      }
    },
    async importStudents(event, courseId) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(`/teacher/courses/${courseId}/import-students`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('导入成功');
      } catch (err) {
        console.error('导入失败', err);
        alert(err.response?.data?.message || '导入失败');
      }
    },
    goToStudentList(courseId) {
      this.$router.push({
        name: 'CourseStudents',
        params: { courseId }
      });
    },
    nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
      }
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
      }
    }
  }
};
</script>

<style scoped>
.student-mgmt {
  padding: 20px;
}

.course-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.course-card {
  width: 300px;
  padding: 15px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-bar {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
</style>
