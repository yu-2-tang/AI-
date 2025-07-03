<template>
  <div class="task-detail">
    <div v-if="isLoading">加载中...</div>
    
    <div v-else-if="task">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h2>{{ task.title }} - 任务详情</h2>

      <div class="task-info">
        <p><strong>任务类型:</strong> {{ displayTaskType(task.type) }}</p>
        <p><strong>截止时间:</strong> {{ task.deadline }}</p>
        <p><strong>任务描述:</strong> {{ task.description }}</p>
      </div>

      <!-- 隐藏的文件输入框，仅用于提交 -->
      <input
        v-if="['CHAPTER_HOMEWORK', 'REPORT_SUBMISSION'].includes(task.type)"
        type="file"
        ref="fileInput"
        multiple
        style="display: none"
        @change="handleFileChange"
      />

      <!-- 任务资源展示 -->
      <div v-if="task.resources && task.resources.length > 0" class="task-resources">
        <h3>任务资源</h3>
        <ul>
          <li v-for="res in task.resources" :key="res.resourceId">
            {{ res.name }}
            <button @click="downloadResource(res)">下载</button>

            <!-- 视频资源 -->
            <template v-if="res.type === 'VIDEO'">
              <button @click="viewVideo(res)">观看</button>
            </template>

            <!-- 可预览类型（PPT 或 文档） -->
            <template v-else-if="['DOCUMENT', 'PPT'].includes(res.type)">
              <button @click="viewPreview(res)">查看</button>

              <!-- 提交按钮显示在“查看”旁边 -->
              <button
                v-if="['CHAPTER_HOMEWORK', 'REPORT_SUBMISSION'].includes(task.type)"
                @click="triggerFileInput"
              >
                提交
              </button>
            </template>
          </li>
        </ul>
      </div>

      <!-- 试卷答题 -->
      <div v-if="task.type === 'EXAM_QUIZ'">
        <button class="btn primary-btn" @click="startExam">开始答题</button>
      </div>
    </div>

    <div v-else>
      <p>未找到该任务，请检查链接是否正确。</p>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'TaskDetail',
  props: ['id'],
  data() {
     return {
      task: null,
      isLoading: true
    }
  },
  methods: {
    // 触发 file input
  triggerFileInput() {
    this.$refs.fileInput.click()
  },

  // 文件选择完成后的处理
  handleFileChange(event) {
    const files = event.target.files
    if (files.length === 0) return

    this.selectedFiles = Array.from(files)
    this.submitFiles()
  },

  async submitFiles() {
    if (!this.selectedFiles.length) {
      alert('请选择要提交的文件')
      return
    }

    const formData = new FormData()
    const studentId = localStorage.getItem('student_id') // 你也可以从用户状态获取

    formData.append('task_id', this.task.taskId || this.id)
    formData.append('student_id', studentId)

    this.selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('http://localhost:8082/api/submissions/submit/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : undefined
        }
      })

      alert(res.data.message || '提交成功')
      this.selectedFiles = []
    } catch (err) {
      console.error('提交失败:', err)
      alert(err.response?.data?.message || '提交失败')
    }
  },
    submitTask(task) {
      console.log('提交任务:', task.taskId || task.id)
    },
    async fetchTask() {
      try {
        const res = await axios.get(`/student/tasks/${this.id}`)
        this.task = res.data?.data || res.data
      } catch (err) {
        console.error('加载任务失败', err)
        alert(err.response?.data?.message || '加载任务失败')
      } finally {
        this.isLoading = false
      }
    },
    displayTaskType(type) {
      const map = {
        CHAPTER_HOMEWORK: '章节作业',
        VIDEO_WATCHING: '视频观看',
        MATERIAL_READING: '阅读材料',
        PPT_VIEW: 'PPT浏览',
        REPORT_SUBMISSION: '报告上传',
        EXAM_QUIZ: '试卷答题'
      }
      return map[type] || type
    },
    async downloadResource(resource) {
  try {
    const token = localStorage.getItem('token')
    const url = `http://localhost:8082/api/teacher/resources/${resource.resourceId}/download`
    const response = await axios.get(url, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    })

    const isBlob = Object.prototype.toString.call(response.data) === '[object Blob]'

    if (!isBlob || response.data.size === 0) {
      throw new Error('响应内容无效或文件为空')
    }

    const blob = new Blob([response.data])
    const link = document.createElement('a')
    const fileName = resource.name || `resource_${resource.resourceId}.ppt`
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

  } catch (err) {
    console.error('下载失败:', err)
    alert('资源下载失败: ' + (err.message || '未知错误'))
  }
},
    viewVideo(res) {
      this.$router.push({ name: 'VideoPlayer', params: { resourceId: res.resourceId } })
    },
    viewPreview(res) {
      this.$router.push({ name: 'ResourcePreview', params: { resourceId: res.resourceId } })
    },
    startExam() {
      this.$router.push({ name: 'AnswerExam', params: { taskId: this.id } })
    }
  },
  mounted() {
    this.fetchTask()
  }
}
</script>

<style scoped>
.back-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
}
.task-detail {
  padding: 20px;
}
.task-info {
  margin-bottom: 20px;
}
.task-resources {
  margin-bottom: 20px;
}
.task-resources ul {
  padding-left: 20px;
}
.task-resources li {
  margin-bottom: 8px;
}
button {
  margin-left: 6px;
  padding: 8px 14px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #357ab7;
}
</style>
