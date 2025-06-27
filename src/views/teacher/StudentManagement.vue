<template>
  <div class="student-mgmt">
    <h2>学生信息管理</h2>

    <!-- 批量导入导出按钮 -->
    <div class="action-bar">
      <input type="file" accept=".csv,.xlsx" @change="importStudents" hidden ref="fileInput" />
      <button class="primary-btn" @click="$refs.fileInput.click()">批量导入</button>
      <button class="primary-btn" @click="exportStudents">导出全部</button>
      <button class="primary-btn" @click="addStudent">新增学生</button>
    </div>

    <!-- 学生表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th>姓名</th>
          <th>专业</th>
          <th>年级</th>
          <th>邮箱</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.realName }}</td>
          <td>{{ student.major }}</td>
          <td>{{ student.grade }}</td>
          <td>{{ student.email }}</td>
          <td>
            <button @click="deleteStudent(student.studentId)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '@/axios';

export default {
  name: 'StudentManagement',
  data() {
    return {
      students: [], // 存放课程学生数据
      courseId: this.$route.params.courseId,
    };
  },
  mounted() {
    this.fetchStudents();  // 加载学生列表
  },
  methods: {
    // 获取学生信息
    async fetchStudents() {
      try {
        const response = await axios.get(`/api/teacher/courses/${this.courseId}/students`);
        this.students = response.data; // 处理返回的学生数据
      } catch (err) {
        console.error('获取学生信息失败', err);
        alert('获取学生信息失败');
      }
    },

    // 批量导入学生
    async importStudents() {
      const fileInput = this.$refs.fileInput;
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        await axios.post(`/api/teacher/courses/${this.courseId}/import-students`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('学生导入成功');
        this.fetchStudents(); // 重新加载学生列表
      } catch (err) {
        console.error('导入学生失败', err);
        alert('导入学生失败');
      }
    },

    // 导出学生
    exportStudents() {
      console.log('导出学生列表');
      // 你可以根据后端的API实现学生的导出功能
    },

    // 新增学生
    addStudent() {
      console.log('新增学生');
      // 跳转到新增学生页面
    },

    // 删除学生
    async deleteStudent(studentId) {
      try {
        await axios.delete(`/api/teacher/courses/${this.courseId}/students/${studentId}`);
        alert('学生删除成功');
        this.fetchStudents();  // 重新加载学生列表
      } catch (err) {
        console.error('删除学生失败', err);
        alert('删除学生失败');
      }
    }
  }
};
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
</style>
