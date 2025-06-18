<template>
  <div class="learning-analytics">
    <h2>学习数据分析</h2>
    
    <div class="filters">
      <el-select v-model="courseId" placeholder="选择课程">
        <el-option
          v-for="course in courses"
          :key="course.id"
          :label="course.name"
          :value="course.id"
        ></el-option>
      </el-select>
      
      <el-select v-model="taskType" placeholder="选择任务类型">
        <el-option
          v-for="type in taskTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        ></el-option>
      </el-select>
    </div>
    
    <div class="charts">
      <div class="chart-container">
        <h3>成绩分布</h3>
        <!-- 这里实际应该用echarts或chart.js -->
        <div class="chart-placeholder"></div>
      </div>
      
      <div class="chart-container">
        <h3>完成率</h3>
        <div class="chart-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LearningAnalytics',
  data() {
    return {
      courseId: '',
      taskType: '',
      courses: [
        { id: 1, name: '计算机科学导论' },
        { id: 2, name: '数据结构与算法' }
      ],
      taskTypes: [
        { value: 'homework', label: '作业' },
        { value: 'quiz', label: '测验' },
        { value: 'project', label: '项目' }
      ]
    }
  }
}
</script>

<style scoped>
.learning-analytics {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.chart-placeholder {
  height: 300px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>