<template>
  <div class="student-mgmt">
    <h2>学生信息管理</h2>
    <div class="action-bar">
      <button class="primary-btn" @click="showAddModal = true">新增学生</button>
      <button class="primary-btn" @click="$refs.fileInput.click()">批量导入</button>
      <input type="file" accept=".csv,.xlsx" @change="importStudents" hidden ref="fileInput" />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>学号</th><th>姓名</th><th>专业</th><th>年级</th><th>邮箱</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.studentNumber">
          <td>{{ student.studentNumber }}</td>
          <td>{{ student.realName }}</td>
          <td>{{ student.major }}</td>
          <td>{{ student.grade }}</td>
          <td>{{ student.email }}</td>
          <td>
            <button @click="openEditModal(student)">编辑</button>
            <button @click="deleteStudent(student.studentNumber)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="page === 1" @click="page-- && fetchStudents()">上一页</button>
      <span>第 {{ page }} 页</span>
      <button :disabled="students.length < size" @click="page++ && fetchStudents()">下一页</button>
    </div>

    <div v-if="showAddModal" class="modal">
      <h3>新增学生</h3>
      <form @submit.prevent="createStudent">
        <input v-model="newStudent.realName" placeholder="姓名" required />
        <input v-model="newStudent.studentNumber" placeholder="学号" required />
        <input v-model="newStudent.grade" placeholder="年级" required />
        <input v-model="newStudent.major" placeholder="专业" required />
        <button type="submit">提交</button>
        <button type="button" @click="showAddModal = false">取消</button>
      </form>
    </div>

    <div v-if="editStudentModal" class="modal">
      <h3>编辑学生</h3>
      <form @submit.prevent="updateStudent">
        <input v-model="editStudent.realName" placeholder="姓名" required />
        <input v-model="editStudent.grade" placeholder="年级" required />
        <input v-model="editStudent.major" placeholder="专业" required />
        <button type="submit">更新</button>
        <button type="button" @click="editStudentModal = false">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'AdminStudentManagement',
  data() {
    return {
      students: [],
      showAddModal: false,
      editStudentModal: false,
      page: 1,
      size: 10,
      newStudent: {
        realName: '', studentNumber: '', grade: '', major: ''
      },
      editStudent: {}
    }
  },
  methods: {
    async fetchStudents() {
      try {
        const res = await api.get('/admin/student/students', {
          params: { page: this.page, size: this.size }
        })
        this.students = res.students || []
      } catch (err) {
        console.error('获取学生失败', err)
      }
    },
    async importStudents(e) {
      const file = e.target.files[0]
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      try {
        await api.post('/admin/student/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('导入成功')
        this.fetchStudents()
      } catch (err) {
        console.error('导入失败', err)
        alert('导入失败')
      }
    },
    async deleteStudent(studentNumber) {
      try {
        await api.delete(`/admin/student/${studentNumber}`)
        this.fetchStudents()
      } catch (err) {
        console.error('删除失败', err)
      }
    },
    async createStudent() {
      try {
        await api.post('/admin/student', this.newStudent)
        alert('创建成功')
        this.showAddModal = false
        this.fetchStudents()
      } catch (err) {
        console.error('创建失败', err)
        alert(err.response?.data?.message || '创建失败')
      }
    },
    openEditModal(student) {
      this.editStudent = { ...student }
      this.editStudentModal = true
    },
    async updateStudent() {
      try {
        await api.put(`/admin/student/${this.editStudent.studentNumber}`, this.editStudent)
        alert('更新成功')
        this.editStudentModal = false
        this.fetchStudents()
      } catch (err) {
        console.error('更新失败', err)
        alert(err.response?.data?.message || '更新失败')
      }
    }
  },
  mounted() {
    this.fetchStudents()
  }
}
</script>

<style scoped>
.student-mgmt { padding: 20px; }
.action-bar { margin-bottom: 15px; display: flex; gap: 10px; }
.primary-btn {
  background: #4a90e2; color: #fff; border: none; border-radius: 4px;
  padding: 8px 18px; cursor: pointer; transition: 0.3s;
}
.primary-btn:hover { opacity: 0.9; }
.data-table {
  width: 100%; border-collapse: collapse; margin-top: 10px;
}
.data-table th, .data-table td {
  border: 1px solid #ddd; padding: 8px; text-align: center;
}
.modal {
  background: #fff; border: 1px solid #ccc; padding: 20px; margin-top: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.2); border-radius: 6px;
}
.pagination {
  margin-top: 15px; display: flex; gap: 10px; align-items: center;
}
</style>