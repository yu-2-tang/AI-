<template>
  <div class="teacher-mgmt">
    <h2>教师信息管理</h2>
    <div class="action-bar">
      <input type="file" accept=".csv,.xlsx" @change="importTeachers" hidden ref="fileInput" />
      <button class="primary-btn" @click="$refs.fileInput.click()">批量导入</button>
      <button class="primary-btn" @click="exportTeachers">导出全部</button>
      <button class="primary-btn" @click="addTeacher">新增教师</button>
    </div>
    <TeacherTable :teachers="teachers" @delete="deleteTeacher" />
  </div>
</template>

<script>
import TeacherTable from '../shared/TeacherTable.vue'

export default {
  name: 'AdminTeacherManagement',
  components: { TeacherTable },
  data() {
    return {
      teachers: [
        { id: 1, name: '张教授', title: '教授', department: '计算机学院', email: 'zhang@example.com' },
        { id: 2, name: '李教授', title: '副教授', department: '软件学院', email: 'li@example.com' }
      ]
    }
  },
  methods: {
    importTeachers(e) {
      console.log('导入文件: ', e.target.files[0])
    },
    exportTeachers() {
      console.log('导出教师列表')
    },
    addTeacher() {
      console.log('新增教师')
    },
    deleteTeacher(id) {
      this.teachers = this.teachers.filter(t => t.id !== id)
    }
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
</style>