<template>
  <div class="student-task-wrapper">
    <h2>我的课程任务</h2>
    
    <!-- 已选课程列表 -->
    <div v-for="course in enrolledCourses" :key="course.courseId" class="course-section">
      <div class="course-header">
        <h3>{{ course.name }} ({{ course.courseCode }})</h3>
        <p>学期: {{ course.semester }}</p>
      </div>
      
      <!-- 课程资源 -->
      <div class="resources-section" v-if="course.resources?.content?.length">
        <h4>课程资源</h4>
        <div class="resource-grid">
          <div v-for="resource in course.resources.content" :key="resource.resourceId" class="resource-card">
            <div class="resource-info">
              <span class="resource-type">{{ formatResourceType(resource.type) }}</span>
              <span class="resource-name">{{ resource.name }}</span>
              <span class="resource-size">{{ formatFileSize(resource.size) }}</span>
            </div>
            <div class="resource-actions">
              <button class="btn outline" @click="viewResource(resource)">查看</button>
              <button class="btn primary" @click="downloadResource(resource)">下载</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 课程任务 -->
      <div class="tasks-section" v-if="course.tasks?.length">
        <h4>课程任务</h4>
        <table class="task-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>类型</th>
              <th>截止时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in course.tasks" :key="task.taskId">
              <td>{{ task.title }}</td>
              <td>{{ formatTaskType(task.type) }}</td>
              <td>{{ formatDate(task.deadline) }}</td>
              <td :class="getTaskStatusClass(task)">{{ getTaskStatus(task) }}</td>
              <td>
                <button class="btn outline" @click="viewTask(task)">查看</button>
                <button class="btn primary" @click="submitTask(task)">提交</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="!course.resources?.content?.length && !course.tasks?.length" class="empty-state">
        暂无资源和任务
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'StudentTask',
  data() {
    return {
      enrolledCourses: []
    }
  },
  methods: {
    async fetchEnrolledCoursesWithDetails() {
      try {
        const coursesRes = await api.get('/student/courses')
        const courses = coursesRes?.content || []
        
        this.enrolledCourses = await Promise.all(
          courses.map(async course => {
            try {
              const [resourcesRes, tasksRes] = await Promise.all([
                api.get(`/student/courses/${course.courseId}/resources`, {
                  params: { page: 1, size: 100 }
                }),
                api.get(`/student/courses/${course.courseId}/tasks`, {
                  params: { page: 1, size: 100 }
                })
              ])
              
              return {
                ...course,
                resources: resourcesRes.data || { content: [] },
                tasks: tasksRes.data || []
              }
            } catch (error) {
              console.error(`获取课程 ${course.courseId} 详情失败:`, error)
              return {
                ...course,
                resources: { content: [] },
                tasks: []
              }
            }
          })
        )
      } catch (err) {
        console.error('获取已选课程列表失败:', err)
        this.showMessage('error', '加载课程数据失败，请稍后再试')
      }
    },
    
    formatResourceType(type) {
      const typeMap = {
        'PDF': 'PDF文档',
        'PPT': 'PPT课件',
        'VIDEO': '视频',
        'DOCUMENT': '文档'
      }
      return typeMap[type] || type
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    },
    
    formatTaskType(type) {
      const typeMap = {
        'CHAPTER_HOMEWORK': '章节作业',
        'VIDEO_WATCHING': '视频观看',
        'MATERIAL_READING': '阅读材料',
        'PPT_VIEW': 'PPT浏览'
      }
      return typeMap[type] || type
    },
    
    formatDate(dateString) {
      if (!dateString) return '无截止时间'
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getTaskStatus(task) {
      if (!task.deadline) return '进行中'
      return new Date() > new Date(task.deadline) ? '已截止' : '进行中'
    },
    
    getTaskStatusClass(task) {
      return {
        'status-ongoing': this.getTaskStatus(task) === '进行中',
        'status-expired': this.getTaskStatus(task) === '已截止'
      }
    },
    
    async viewResource(resource) {
      try {
        switch (resource.type.toUpperCase()) {
          case 'PDF':
          case 'PPT':
          case 'DOCUMENT':
            this.$router.push({
              name: 'ResourcePreview',
              params: { resourceId: resource.resourceId }
            })
            break
            
          case 'VIDEO':
            this.$router.push({
              name: 'VideoPlayer',
              params: { resourceId: resource.resourceId }
            })
            break
            
          default:
            await this.downloadResource(resource)
        }
      } catch (err) {
        console.error('查看资源失败:', err)
        this.showMessage('error', '无法查看该资源')
      }
    },
    
    async downloadResource(resource) {
      let loadingInstance = null
      try {
        loadingInstance = this.$loading({
          lock: true,
          text: '准备下载...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        const response = await api.get(
          `/student/resources/${resource.resourceId}/download`,
          {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                )
                loadingInstance.text = `下载中... ${percentCompleted}%`
              }
            }
          }
        )

        // 处理文件名
        let fileName = resource.name || `resource_${resource.resourceId}`
        const contentDisposition = response.headers['content-disposition']
        
        if (contentDisposition) {
          const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
          if (utf8FilenameMatch) {
            fileName = decodeURIComponent(utf8FilenameMatch[1])
          } else {
            const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
            if (filenameMatch && filenameMatch[1]) {
              fileName = filenameMatch[1]
            }
          }
        }

        // 确保文件扩展名
        if (!fileName.includes('.')) {
          const extMap = {
            'PDF': 'pdf',
            'PPT': 'ppt',
            'DOCUMENT': 'docx',
            'VIDEO': 'mp4',
            'IMAGE': 'jpg'
          }
          fileName += `.${extMap[resource.type] || 'bin'}`
        }

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        
        loadingInstance.text = '下载完成，准备文件...'

        // 清理
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          loadingInstance.close()
          this.showMessage('success', `${fileName} 下载完成`)
        }, 100)
        
      } catch (err) {
        console.error('下载失败:', err)
        loadingInstance && loadingInstance.close()
        
        let errorMsg = '下载失败'
        if (err.response) {
          switch (err.response.status) {
            case 404: errorMsg = '资源不存在'; break
            case 403: errorMsg = '无权下载此资源'; break
            case 401: 
              errorMsg = '请先登录'
              this.$router.push('/login')
              break
            case 500: errorMsg = '服务器错误'; break
          }
        } else if (err.code === 'ECONNABORTED') {
          errorMsg = '下载超时，请重试'
        } else if (err.message.includes('Network Error')) {
          errorMsg = '网络连接失败'
        }
        
        this.showMessage('error', errorMsg)
      }
    },
    
    showMessage(type, message) {
      if (this.$message) {
        this.$message[type](message)
      } else {
        // 备用提示方式
        alert(message)
      }
    },
    
    viewTask(task) {
      this.$router.push({
        name: 'TaskDetail',
        params: { id: task.taskId }
      })
    },
    
    async submitTask(task) {
      try {
        await api.post(`/student/tasks/${task.taskId}/submissions`, {
          // 提交数据
        })
        this.showMessage('success', '任务提交成功')
      } catch (err) {
        console.error('提交任务失败:', err)
        this.showMessage('error', err.response?.data?.message || '任务提交失败')
      }
    }
  },
  mounted() {
    this.fetchEnrolledCoursesWithDetails()
  }
}
</script>

<style scoped>
.student-task-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.course-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.course-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.resource-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th, .task-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: left;
}

.status-ongoing {
  color: #4CAF50;
}

.status-expired {
  color: #F44336;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #888;
}

.resource-size {
  font-size: 0.8em;
  color: #666;
  margin-left: 8px;
}

.resource-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn.outline {
  background: transparent;
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.btn.primary {
  background: #4a90e2;
  border: none;
  color: white;
}

.btn.outline:hover {
  background: rgba(74, 144, 226, 0.1);
}

@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-actions {
    flex-direction: column;
  }
  
  .task-table {
    display: block;
    overflow-x: auto;
  }
}
</style>