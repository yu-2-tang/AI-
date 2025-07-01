<template>
  <div class="course-detail-wrapper">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="$router.back()">← 返回</button>

    <div class="course-detail">
      <!-- 左侧课程信息 -->
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

      <!-- 右侧知识图谱 -->
      <div class="graph-container">
        <h3>课程知识图谱</h3>
        <div id="courseKnowledgeGraph" class="graph-box"></div>
      </div>
    </div>

    <!-- 下方资源区域 -->
    <div class="resource-section">
      <h3>课程资源</h3>
      <table v-if="resources.length">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>大小</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in resources" :key="res.resourceId">
            <td>{{ res.name }}</td>
            <td>{{ res.type }}</td>
            <td>{{ formatSize(res.size) }}</td>
            <td>{{ formatDate(res.uploadTime) }}</td>
            <td>
              <button class="btn" @click="downloadResource(res)">下载</button>
              <button class="btn" @click="viewResource(res)">查看</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>暂无资源</p>
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
      resources: []
    }
  },
  methods: {
    getRole() {
      return localStorage.getItem('userRole') || 'STUDENT'
    },
    getDetailUrl() {
      return this.getRole() === 'TEACHER'
        ? `/teacher/courses/${this.courseId}`
        : `/student/courses/${this.courseId}`
    },
    getGraphUrl() {
      return this.getRole() === 'TEACHER'
        ? `/teacher/courses/${this.courseId}/knowledge-graph`
        : `/student/courses/${this.courseId}/knowledge-graph`
    },
    getResourceUrl() {
      return this.getRole() === 'TEACHER'
        ? `/teacher/courses/${this.courseId}/resources`
        : `/student/courses/${this.courseId}/resources`
    },

    async fetchCourseDetail() {
      try {
        const res = await axios.get(this.getDetailUrl())
        this.course = res.data || {}
      } catch (err) {
        console.error('获取课程详情失败', err)
        alert(err.response?.data?.message || '加载课程详情失败')
      }
    },
    async renderKnowledgeGraph() {
      try {
         // 增加超时时间
        const res = await axios.get(this.getGraphUrl(), {
          timeout: 30000 // 增加到30秒
        })
        
        // 确保数据结构正确
        const graphData = res.data || {}
        const nodes = graphData.nodes || []
        const edges = graphData.edges || []

        // 等待DOM渲染完成
        await this.$nextTick()
        
        const chartElement = document.getElementById("courseKnowledgeGraph")
        if (!chartElement) {
          return
        }

        // 销毁已存在的图表实例
        const existingChart = echarts.getInstanceByDom(chartElement)
        if (existingChart) {
          existingChart.dispose()
        }

        const chart = echarts.init(chartElement)
        
        // 如果没有数据，显示提示信息
        if (nodes.length === 0) {
          chartElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
              <div style="text-align: center;">
                <p>暂无知识图谱数据</p>
                <p style="font-size: 12px;">课程还没有建立知识点关系</p>
              </div>
            </div>
          `
          return
        }
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              if (params.dataType === 'node') {
                return `${params.data.name}<br/>ID: ${params.data.id}`
              } else if (params.dataType === 'edge') {
                return `${params.data.source} → ${params.data.target}<br/>关系: ${params.data.type || '关联'}`
              }
            }
          },
          series: [
            {
              type: "graph",
              layout: "force",
              roam: true,
              label: { 
                show: true,
                position: 'right',
                formatter: '{b}'
              },
              force: {
                repulsion: 800,
                edgeLength: [50, 150],
                layoutAnimation: true
              },
              data: nodes.map(n => ({
                id: n.id,
                name: n.name || `节点${n.id}`,
                symbolSize: 50,
                itemStyle: {
                  color: '#4CAF50'
                }
              })),
              edges: edges.map(e => ({
                source: e.source,
                target: e.target,
                type: e.type || "关联",
                label: { 
                  show: true, 
                  formatter: e.type || "关联"
                },
                lineStyle: {
                  color: '#999'
                }
              }))
            }
          ]
        }
        
        chart.setOption(option)
        
        // 窗口大小改变时重新调整图表
        window.addEventListener('resize', () => {
          chart.resize()
        })
        
      } catch (err) {
        // 显示错误信息而不是弹窗
        const chartElement = document.getElementById("courseKnowledgeGraph")
        if (chartElement) {
          chartElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
              <div style="text-align: center;">
                <p>知识图谱加载失败</p>
                <p style="font-size: 12px;">${err.response?.data?.message || err.message}</p>
              </div>
            </div>
          `
        }
      }
    },
    async fetchResources() {
      try {
        const res = await axios.get(this.getResourceUrl(), {
          params: { page: 1, size: 100 }
        })
        this.resources = res.data?.content || []
      } catch (err) {
        console.error('加载资源失败', err)
        alert(err.response?.message || '资源加载失败')
      }
    },
    async downloadResource(resource) {
      try {
        const role = this.getRole()
        const downloadUrl = role === 'TEACHER'
          ? `/teacher/resources/${resource.resourceId}/download`
          : `/student/resources/${resource.resourceId}/download`
        
        const response = await axios.get(downloadUrl, { responseType: 'blob' })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${resource.name}.${resource.url?.split('.').pop() || 'pdf'}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('下载失败', err)
        alert('下载失败')
      }
    },
    viewResource(resource) {
      alert(`预览资源功能尚未实现，资源ID: ${resource.resourceId}`)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString()
    },
    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / 1048576).toFixed(1) + ' MB'
    }
  },
  mounted() {
    this.fetchCourseDetail()
    this.renderKnowledgeGraph()
    this.fetchResources()
  }
}
</script>

<style scoped>
.course-detail-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.back-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
}

.course-detail {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
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

.resource-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.resource-section table {
  width: 100%;
  border-collapse: collapse;
}

.resource-section th,
.resource-section td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.resource-section th {
  background: #f9f9f9;
}

.resource-section .btn {
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  border: 1px solid #4a90e2;
  background: white;
  color: #4a90e2;
  cursor: pointer;
}
</style>
