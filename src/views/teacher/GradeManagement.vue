<template>
  <div class="grade-mgmt">
    <h2>成绩分析</h2>

    <!-- 成绩统计图表 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 导出报表按钮 -->
    <button class="primary-btn" @click="exportReport">导出成绩报表</button>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from '@/axios'

export default {
  name: 'GradeManagement',
  data() {
    return {
      chartInstance: null,
      summaryData: []
    }
  },
  mounted() {
    this.fetchSummary()
  },
  methods: {
    async fetchSummary() {
      try {
        const res = await axios.get('/grade/summary')
        this.summaryData = res.data.data || []
        this.renderChart()
      } catch (err) {
        console.error('获取成绩汇总失败', err)
        alert('加载成绩数据失败')
      }
    },
    renderChart() {
      if (!this.chartInstance) {
        this.chartInstance = echarts.init(this.$refs.chartContainer)
      }

      const option = {
        title: { text: '课程平均成绩分析', left: 'center' },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: this.summaryData.map(item => item.courseName),
          axisLabel: { rotate: 45 }
        },
        yAxis: {
          type: 'value',
          name: '平均分'
        },
        series: [{
          data: this.summaryData.map(item => item.avgGrade),
          type: 'bar',
          itemStyle: { color: '#4a90e2' }
        }]
      }

      this.chartInstance.setOption(option)
    },
    async exportReport() {
      try {
        const res = await axios.get('/report/export-grades', {
          responseType: 'blob'
        })

        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '成绩报表.xlsx'
        a.click()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('导出失败', err)
        alert('导出成绩报表失败')
      }
    }
  }
}
</script>

<style scoped>
.grade-mgmt {
  padding: 20px;
}
.chart-container {
  height: 400px;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
}
.primary-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
}
.primary-btn:hover {
  opacity: 0.9;
}
</style>
