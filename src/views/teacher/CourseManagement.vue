<template>
  <div class="teacher-courses">
    <h2>我的课程</h2>

    <button class="add-btn" @click="showAddForm = true">添加课程</button>

    <div class="course-list">
      <div class="course-card" v-for="course in paginatedCourses" :key="course.courseId">
        <h3>{{ course.name }}</h3>
        <p>课程代码: {{ course.courseCode }}</p>
        <p>学期: {{ course.semester }}</p>
        <p v-if="course.credit !== undefined">学分: {{ course.credit }}</p>
        <p v-if="course.hours !== undefined">学时: {{ course.hours }}</p>
        <div class="course-actions">
          <button class="danger-btn" @click="deleteCourse(course.courseId)">删除课程</button>
          <button class="warning-btn" @click="editCourse(course)">编辑课程</button>
          <router-link
            :to="{ name: 'CourseDetail', params: { id: course.courseId } }"
            class="primary-btn"
          >课程详情</router-link>
          <button class="info-btn" @click="goToResourceManagement(course.courseId)">资源管理</button>
          <button class="info-btn" @click="goToKnowledgePointManagement(course.courseId)">知识点管理</button>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1" class="pagination-btn">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="page >= totalPages" class="pagination-btn">下一页</button>
    </div>

   <!-- 添加课程弹窗 -->
    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h3>添加新课程</h3>

        <label>课程名称</label>
        <input v-model="newCourse.name" placeholder="请输入课程名称" />

        <label>课程代码</label>
        <input v-model="newCourse.courseCode" placeholder="请输入课程代码" />

        <label>学期</label>
        <input v-model="newCourse.semester" placeholder="例如：2025春季" />

        <label>学分</label>
        <input v-model.number="newCourse.credit" placeholder="请输入学分" type="number" />

        <label>学时</label>
        <input v-model.number="newCourse.hours" placeholder="请输入学时" type="number" />

        <label>课程描述</label>
        <textarea v-model="newCourse.description" placeholder="请输入课程描述"></textarea>

        <div class="modal-actions">
          <button @click="createCourse">保存</button>
          <button class="danger-btn" @click="showAddForm = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 编辑课程弹窗 -->
    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal">
        <h3>编辑课程</h3>

        <label>课程名称</label>
        <input v-model="editCourseData.name" placeholder="请输入课程名称" />

        <label>课程代码</label>
        <input v-model="editCourseData.courseCode" placeholder="请输入课程代码" />

        <label>学期</label>
        <input v-model="editCourseData.semester" placeholder="例如：2025春季" />

        <label>学分</label>
        <input v-model.number="editCourseData.credit" placeholder="请输入学分" type="number" />

        <label>学时</label>
        <input v-model.number="editCourseData.hours" placeholder="请输入学时" type="number" />

        <label>课程描述</label>
        <textarea v-model="editCourseData.description" placeholder="请输入课程描述"></textarea>

        <div class="modal-actions">
          <button @click="updateCourse">保存</button>
          <button class="danger-btn" @click="showEditForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'TeacherCourseManagement',
  data() {
    return {
      courses: [],
      page: 1,
      size: 6,
      showAddForm: false,
      showEditForm: false,
      newCourse: {
        name: '', courseCode: '', semester: '', credit: null, hours: null, description: ''
      },
      editCourseData: {
        name: '', courseCode: '', semester: '', credit: null, hours: null, description: ''
      }
    }
  },
  computed: {
    paginatedCourses() {
      const start = (this.page - 1) * this.size;
      const end = this.page * this.size;
      return this.courses.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.courses.length / this.size) || 1;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        const res = await axios.get('/teacher/courses')
        this.courses = res.data || []
      } catch (err) {
        console.error('获取课程失败', err)
        alert(err.response?.data?.message || '加载课程失败')
      }
    },
     // 创建新课程
    async createCourse() {
      try {
        await axios.post('/teacher/courses', this.newCourse)
        alert('课程添加成功')
        this.showAddForm = false
        this.resetForm()
        this.fetchCourses()  // 刷新课程列表
      } catch (err) {
        console.error('添加课程失败', err)
        alert(err.response?.data?.message || '添加失败')
      }
    },
    async deleteCourse(courseId) {
      if (!confirm('确定要删除这门课程吗？')) return
      try {
        await axios.delete(`/teacher/courses/${courseId}`)
        alert('删除成功')
        this.fetchCourses()
      } catch (err) {
        console.error('删除失败', err)
        alert(err.response?.data?.message || '删除失败')
      }
    },
     // 编辑课程按钮
    editCourse(course) {
      // 打开编辑课程的弹窗并加载课程信息
      this.editCourseData = { ...course }
      this.showEditForm = true
    },
    // 更新课程
    async updateCourse() {
      try {
        await axios.put(`/teacher/courses/${this.editCourseData.courseId}`, this.editCourseData)
        alert('课程更新成功')
        this.showEditForm = false
        this.fetchCourses()  // 刷新课程列表
      } catch (err) {
        console.error('更新课程失败', err)
        alert(err.response?.data?.message || '更新失败')
      }
    },
    goToResourceManagement(courseId) {
      this.$router.push({ name: 'ResourceManagement', params: { courseId } })
    },
    goToKnowledgePointManagement(courseId) {
      this.$router.push({ name: 'KnowledgePointManagement', params: { courseId } })
    },
    resetForm() {
      this.newCourse = {
        name: '', courseCode: '', semester: '', credit: null, hours: null, description: ''
      }
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++
    },
    prevPage() {
      if (this.page > 1) this.page--
    }
  },
  mounted() {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.teacher-courses {
  padding: 20px;
}
.add-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 14px;
  margin-bottom: 20px;
  border-radius: 4px;
  cursor: pointer;
}
.course-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.course-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  width: 300px;
}
.course-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.primary-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
}
.info-btn {
  background: #1abc9c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.warning-btn {
  background: #f39c12;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* modal 样式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.modal input, .modal textarea {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
}
.modal label {
  font-weight: bold;
  margin-top: 8px;
  display: block;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
</style>
