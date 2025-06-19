<template>
  <div class="course-detail">
    <h2>{{ course.name }}</h2>
    <p>课程编号: {{ course.courseCode }}</p>
    <p>授课教师: {{ course.teacher || '暂无' }}</p>
    <p>学分: {{ course.credit }}</p>
    <p>学时: {{ course.hours }}</p>
    <p>学期: {{ course.semester }}</p>
    <p>描述: {{ course.description }}</p>

    <hr />

    <!-- 上传资源 -->
    <div class="upload-section">
      <h3>上传课程资源</h3>
      <input type="file" ref="fileInput" @change="uploadFile" />
      <input v-model="resourceName" placeholder="资源名称" />
      <select v-model="resourceType">
        <option value="PDF">PDF</option>
        <option value="PPT">PPT</option>
        <option value="VIDEO">视频</option>
        <option value="DOCUMENT">文档</option>
      </select>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <h3>资源列表</h3>
      <ul>
        <li v-for="res in resources" :key="res.resourceId">
          📄 {{ res.name }}（{{ res.type }}） - {{ res.uploader }} - {{ formatDate(res.uploadTime) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CourseDetail',
  data() {
    return {
      course: {},
      courseId: this.$route.params.id,
      resources: [],
      resourceName: '',
      resourceType: 'PDF'
    }
  },
  methods: {
    async fetchCourseDetail() {
      try {
        const res = await axios.get(`/api/teacher/courses/${this.courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.token}` }
        })
        this.course = res.data.data || {}
      } catch (err) {
        console.error('获取课程详情失败', err)
        alert('获取课程详情失败')
      }
    },
    async fetchResources() {
      try {
        const res = await axios.get(`/api/teacher/courses/${this.courseId}/resources`, {
          headers: { Authorization: `Bearer ${localStorage.token}` }
        })
        this.resources = res.data.data.content || []
      } catch (err) {
        console.error('获取资源失败', err)
      }
    },
    async uploadFile(e) {
      const file = e.target.files[0]
      if (!file || !this.resourceName || !this.resourceType) {
        alert('请填写资源名称和类型并选择文件')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', this.resourceName)
      formData.append('type', this.resourceType)

      try {
        await axios.post(`/api/teacher/courses/${this.courseId}/resources`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        this.resourceName = ''
        this.resourceType = 'PDF'
        this.$refs.fileInput.value = ''
        this.fetchResources()
      } catch (err) {
        console.error('上传失败', err)
        alert('上传资源失败')
      }
    },
    formatDate(dateStr) {
      const d = new Date(dateStr)
      return d.toLocaleString()
    }
  },
  mounted() {
    this.fetchCourseDetail()
    this.fetchResources()
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.upload-section {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}
.upload-section input,
.upload-section select {
  display: block;
  margin: 10px 0;
  padding: 6px;
  width: 100%;
}

.resource-list {
  margin-top: 30px;
}
.resource-list ul {
  list-style-type: none;
  padding: 0;
}
.resource-list li {
  padding: 6px 0;
  border-bottom: 1px dashed #ccc;
}
</style>

