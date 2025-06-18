<template>
  <div class="student-grades">
    <h2>我的成绩</h2>
    <table class="grades-table">
      <thead>
        <tr>
          <th>课程名称</th>
          <th>平时成绩</th>
          <th>考试成绩</th>
          <th>总成绩</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="grade in grades" :key="grade.courseId">
          <td>{{ grade.courseName }}</td>
          <td>{{ grade.regularGrade }}</td>
          <td>{{ grade.examGrade }}</td>
          <td>{{ grade.totalGrade }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'StudentGrades',
  data() {
    return {
      grades: [
        {
          courseId: 1,
          courseName: '计算机科学导论',
          regularGrade: 90,
          examGrade: 85,
          totalGrade: 87
        },
        {
          courseId: 2,
          courseName: '数据结构与算法',
          regularGrade: 88,
          examGrade: 92,
          totalGrade: 90
        }
      ]
    }
  }
}
</script>

<style scoped>
.student-grades {
  padding: 20px;
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.grades-table th,
.grades-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.grades-table th {
  background-color: #f5f7fa;
}
</style>