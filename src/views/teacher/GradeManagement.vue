<template>
  <div class="grade-mgmt">
    <h2>成绩分析</h2>

    <!-- 示例：成绩走势图 / 柱状图占位 -->
    <div class="chart-placeholder">
      <p>📊 这里可集成 ECharts / Chart.js 动态生成可视化。</p>
      <p>可按课程、学生、任务维度切换。</p>
    </div>

    <!-- 导出报表按钮 -->
    <button class="primary-btn" @click="exportReport">导出成绩报表</button>
  </div>
</template>

<script>
export default {
  name: 'GradeManagement',
  methods: {
    exportReport() { console.log('导出成绩报表') }
  }
}
</script>

<style scoped>
.grade-mgmt { padding: 20px; }
.chart-placeholder {
  height: 280px; border: 2px dashed #c7e0ff;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  margin-bottom: 20px; color: #666;
}
.primary-btn { @apply bg-[#4a90e2] text-white rounded px-4 py-2; }
.primary-btn:hover { opacity: .9; }
</style>
