<template>
  <div class="student-mgmt">
    <h2>学生信息管理</h2>
    <div class="action-bar">
      <input type="file" accept=".csv,.xlsx" @change="importStudents" hidden ref="fileInput" />
      <button class="primary-btn" @click="$refs.fileInput.click()">批量导入</button>
      <button class="primary-btn" @click="exportStudents">导出全部</button>
      <button class="primary-btn" @click="addStudent">新增学生</button>
    </div>
    <StudentTable :students="students" @delete="deleteStudent" />
  </div>
</template>

<script>
import StudentTable from '../shared/StudentTable.vue'

export default {
  name: 'AdminStudentManagement',
  components: { StudentTable },
  data() {
    return {
      students: [
        { id: 1, name: '张三', major: '计算机科学', year: '大二', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', major: '软件工程', year: '大三', email: 'lisi@example.com' }
      ]
    }
  },
  methods: {
    importStudents(e) {
      console.log('导入文件: ', e.target.files[0])
    },
    exportStudents() {
      console.log('导出学生列表')
    },
    addStudent() {
      console.log('新增学生')
    },
    deleteStudent(id) {
      this.students = this.students.filter(s => s.id !== id)
    }
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
</style>