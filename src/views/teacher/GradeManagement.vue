<template>
  <div class="grade-management">
    <h2>成绩管理</h2>
    
    <div class="filters">
      <div class="filter-group">
        <label>课程:</label>
        <select v-model="selectedCourse">
          <option value="">全部课程</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>任务类型:</label>
        <select v-model="selectedTaskType">
          <option value="">全部类型</option>
          <option value="homework">作业</option>
          <option value="quiz">测试</option>
          <option value="project">项目</option>
        </select>
      </div>
    </div>
    
    <div class="grade-table">
      <table>
        <thead>
          <tr>
            <th>学生姓名</th>
            <th>学号</th>
            <th>课程</th>
            <th>任务</th>
            <th>成绩</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in filteredGrades" :key="grade.id">
            <td>{{ grade.studentName }}</td>
            <td>{{ grade.studentId }}</td>
            <td>{{ grade.course }}</td>
            <td>{{ grade.task }}</td>
            <td>{{ grade.score }}</td>
            <td>
              <button @click="editGrade(grade)" class="btn-edit">编辑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="export-section">
      <button @click="exportGrades" class="btn-primary">导出成绩报表</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradeManagement',
  data() {
    return {
      selectedCourse: '',
      selectedTaskType: '',
      courses: [
        { id: 1, name: '人工智能基础' },
        { id: 2, name: '机器学习' },
        { id: 3, name: '深度学习' }
      ],
      grades: [
        { id: 1, studentName: '张三', studentId: '2023001', course: '人工智能基础', task: '第一章作业', score: 85 },
        { id: 2, studentName: '李四', studentId: '2023002', course: '人工智能基础', task: '第一章作业', score: 92 },
        { id: 3, studentName: '王五', studentId: '2023003', course: '机器学习', task: '期中测试', score: 78 }
      ]
    }
  },
  computed: {
    filteredGrades() {
      let result = [...this.grades]
      if (this.selectedCourse) {
        result = result.filter(g => g.course === this.courses.find(c => c.id === this.selectedCourse).name)
      }
      if (this.selectedTaskType) {
        result = result.filter(g => {
          if (this.selectedTaskType === 'homework') return g.task.includes('作业')
          if (this.selectedTaskType === 'quiz') return g.task.includes('测试')
          if (this.selectedTaskType === 'project') return g.task.includes('项目')
          return true
        })
      }
      return result
    }
  },
  methods: {
    editGrade(grade) {
      // 实现编辑成绩逻辑
      console.log('编辑成绩:', grade)
    },
    exportGrades() {
      // 实现导出成绩逻辑
      console.log('导出成绩报表')
    }
  }
}
</script>

<style scoped>
.grade-management {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.grade-table {
  margin: 20px 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

tr:hover {
  background-color: #f5f5f5;
}

.btn-edit {
  background: #3a7bd5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #3a7bd5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.export-section {
  margin-top: 20px;
  text-align: right;
}
</style>