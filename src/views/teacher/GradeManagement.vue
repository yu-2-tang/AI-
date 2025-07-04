<template>
  <div class="grade-mgmt">
    <h2>成绩分析</h2>

    <label>选择课程：
      <select v-model="selectedCourseId" @change="fetchReport">
        <option disabled value="">请选择课程</option>
        <option v-for="c in courses" :key="c.courseId" :value="c.courseId">
          {{ c.name }}
        </option>
      </select>
    </label>

    <div v-if="report && report.performers?.length">
      <table>
        <thead>
          <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>得分率</th>
            <th>班级排名</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in report.performers" :key="s.studentNumber">
            <td>{{ s.studentNumber }}</td>
            <td>{{ s.studentName }}</td>
            <td>{{ s.gradeRate.toFixed(2) }}%</td>
            <td>{{ s.rank }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>暂无学生成绩数据</p>
    </div>

    <button class="primary-btn" @click="exportReport" :disabled="!selectedCourseId">
      导出成绩报表
    </button>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  data() {
    return {
      courses: [],
      selectedCourseId: '',
      report: null
    }
  },
  mounted() {
    this.fetchCourses()
  },
  methods: {
    async fetchCourses() {
      try {
        const res = await axios.get('/teacher/courses')
        this.courses = res.data || []
      } catch (err) {
        console.error('获取课程失败', err)
      }
    },
    async fetchReport() {
      if (!this.selectedCourseId) return
      try {
        const res = await axios.get(`/reports/course/${this.selectedCourseId}`)
        this.report = res || { performers: [] }
      } catch (err) {
        console.error('获取成绩报告失败', err)
        this.report = null
      }
    },
    async exportReport() {
  if (!this.selectedCourseId) return;

  try {
    const res = await axios.get(`/reports/export/${this.selectedCourseId}`, {
      responseType: 'blob'
    });

    // 确保是 Blob 类型
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 🚨 这里用 blob.size 检查，而不是 res.data.size
    if (blob.size === 0) {
      alert('导出的文件为空');
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '成绩报表.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败');
  }
}


  }
}
</script>

<style scoped>
.grade-mgmt {
  padding: 20px;
}
.primary-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  margin-top: 16px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
table th, table td {
  padding: 8px;
  border: 1px solid #ccc;
}
</style>
