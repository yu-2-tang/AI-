<template>
  <div class="course-detail">
    <div class="course-info">
      <h2>{{ course.name }}</h2>
      <p>课程编号: {{ course.courseCode }}</p>
      <p>学分: {{ course.credit }}</p>
      <p>学时: {{ course.hours }}</p>
      <p>学期: {{ course.semester }}</p>
      <p>描述: {{ course.description }}</p>
      <p>学生人数: {{ course.studentCount }}</p>
      <p>任务数量: {{ course.taskCount }}</p>
    </div>

    <div class="graph-container">
      <h3>课程知识图谱</h3>
      <div id="courseKnowledgeGraph" class="graph-box"></div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'
import * as echarts from 'echarts'

export default {
  name: 'CourseDetail',
  data() {
    return {
      courseId: this.$route.params.id,
      course: {},
    }
  },
  methods: {
    async fetchCourseDetail() {
      try {
        const res = await axios.get(`/teacher/courses/${this.courseId}`)
        this.course = res.data || {}
      } catch (err) {
        console.error('获取课程详情失败', err)
        alert(err.response?.data?.message || '加载课程详情失败')
      }
    },
    async renderKnowledgeGraph() {
      try {
        const res = await axios.get(`/teacher/courses/${this.courseId}/knowledge-graph`)
        const { nodes, edges } = res.data

        const chart = echarts.init(document.getElementById("courseKnowledgeGraph"))
        const option = {
          tooltip: {},
          series: [
            {
              type: "graph",
              layout: "force",
              roam: true,
              label: { show: true },
              force: {
                repulsion: 800,
                edgeLength: [50, 150]
              },
              data: nodes.map(n => ({
                id: n.id,
                name: n.name,
                symbolSize: 50
              })),
              edges: edges.map(e => ({
                source: e.sourceId,
                target: e.targetId,
                label: { show: true, formatter: () => e.type || "关联" }
              }))
            }
          ]
        }
        chart.setOption(option)
      } catch (err) {
        console.error("加载知识图谱失败", err)
      }
    }
  },
  mounted() {
    this.fetchCourseDetail()
    this.renderKnowledgeGraph()
  }
}
</script>

<style scoped>
.course-detail {
  display: flex;
  gap: 40px;
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}
.course-info {
  flex: 1;
}
.graph-container {
  flex: 1;
}
.graph-box {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
