<template>
  <div class="teacher-mgmt">
    <h2>教师信息管理</h2>
    <div class="action-bar">
      <button class="primary-btn" @click="showAddModal = true">新增教师</button>
      <button class="primary-btn" @click="$refs.fileInput.click()">批量导入</button>
      <input type="file" accept=".csv,.xlsx" @change="importTeachers" hidden ref="fileInput" />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>工号</th><th>姓名</th><th>职称</th><th>院系</th><th>邮箱</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="teacher in teachers" :key="teacher.employeeNumber">
          <td>{{ teacher.employeeNumber }}</td>
          <td>{{ teacher.realName }}</td>
          <td>{{ teacher.title }}</td>
          <td>{{ teacher.department }}</td>
          <td>{{ teacher.email }}</td>
          <td>
            <button @click="openEditModal(teacher)">编辑</button>
            <button @click="deleteTeacher(teacher.employeeNumber)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="page === 1" @click="page-- && fetchTeachers()">上一页</button>
      <span>第 {{ page }} 页</span>
      <button :disabled="teachers.length < size" @click="page++ && fetchTeachers()">下一页</button>
    </div>

    <div v-if="showAddModal" class="modal">
      <h3>新增教师</h3>
      <form @submit.prevent="createTeacher">
        <input v-model="newTeacher.realName" placeholder="姓名" required />
        <input v-model="newTeacher.employeeNumber" placeholder="工号" required />
        <input v-model="newTeacher.title" placeholder="职称" required />
        <input v-model="newTeacher.department" placeholder="院系" required />
        <textarea v-model="newTeacher.bio" placeholder="简介"></textarea>
        <button type="submit">提交</button>
        <button type="button" @click="showAddModal = false">取消</button>
      </form>
    </div>

    <div v-if="editTeacherModal" class="modal">
      <h3>编辑教师</h3>
      <form @submit.prevent="updateTeacher">
        <input v-model="editTeacher.realName" placeholder="姓名" required />
        <input v-model="editTeacher.title" placeholder="职称" required />
        <input v-model="editTeacher.department" placeholder="院系" required />
        <textarea v-model="editTeacher.bio" placeholder="简介"></textarea>
        <button type="submit">更新</button>
        <button type="button" @click="editTeacherModal = false">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'AdminTeacherManagement',
  data() {
    return {
      teachers: [],
      showAddModal: false,
      editTeacherModal: false,
      page: 1,
      size: 10,
      newTeacher: {
        realName: '', employeeNumber: '', title: '', department: '', bio: ''
      },
      editTeacher: {}
    }
  },
  methods: {
    async fetchTeachers() {
      try {
        const res = await api.get('/admin/teacher/teachers', {
          params: { page: this.page, size: this.size }
        })
        this.teachers = res.teachers || []
      } catch (err) {
        console.error('获取教师失败', err)
      }
    },
    async importTeachers(e) {
      const file = e.target.files[0]
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      try {
        await api.post('/admin/teacher/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('导入成功')
        this.fetchTeachers()
      } catch (err) {
        console.error('导入失败', err)
        alert('导入失败')
      }
    },
    async deleteTeacher(employeeNumber) {
      try {
        await api.delete(`/admin/teacher/${employeeNumber}`)
        this.fetchTeachers()
      } catch (err) {
        console.error('删除失败', err)
      }
    },
    async createTeacher() {
      try {
        await api.post('/admin/teacher', this.newTeacher)
        alert('创建成功')
        this.showAddModal = false
        this.fetchTeachers()
      } catch (err) {
        console.error('创建失败', err)
        alert(err.response?.data?.error || '创建失败')
      }
    },
    openEditModal(teacher) {
      this.editTeacher = { ...teacher }
      this.editTeacherModal = true
    },
    async updateTeacher() {
      try {
        await api.put(`/admin/teacher/${this.editTeacher.employeeNumber}`, this.editTeacher)
        alert('更新成功')
        this.editTeacherModal = false
        this.fetchTeachers()
      } catch (err) {
        console.error('更新失败', err)
        alert(err.response?.data?.error || '更新失败')
      }
    }
  },
  mounted() {
    this.fetchTeachers()
  }
}
</script>

<style scoped>
.teacher-mgmt { padding: 20px; }
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
