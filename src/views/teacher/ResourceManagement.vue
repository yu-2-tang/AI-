<template>
  <div class="resource-mgmt">
    <h2>资源管理</h2>
    <div class="action-bar">
      <input type="file" ref="fileInput" @change="handleUpload" />
      <input v-model="resourceName" placeholder="资源名称" />
      <select v-model="resourceType">
        <option value="PDF">PDF</option>
        <option value="PPT">PPT</option>
        <option value="VIDEO">视频</option>
      </select>
      <button class="btn primary-btn" @click="upload">上传</button>
    </div>
    <table>
      <thead><tr><th>名称</th><th>类型</th><th>上传人</th><th>时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="res in resources" :key="res.id">
          <td>{{ res.name }}</td>
          <td>{{ res.type }}</td>
          <td>{{ res.uploader }}</td>
          <td>{{ formatDate(res.uploadTime) }}</td>
          <td><button class="btn outline-btn" @click="download(res)">下载</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '@/axios'
export default {
  props: ['courseId'],
  data() {
    return {
      resources: [], resourceName: '', resourceType: 'PDF', selectedFile: null
    }
  },
  methods: {
    async fetchResources() {
      const res = await axios.get(`/api/resource/list/${this.courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.token}` }
      })
      this.resources = res.data.data || []
    },
    handleUpload(e) { this.selectedFile = e.target.files[0] },
    async upload() {
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      formData.append('name', this.resourceName)
      formData.append('type', this.resourceType)
      await axios.post(`/api/resource/upload/${this.courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      this.fetchResources()
    },
    async download(res) {
      const r = await axios.get(`/api/resource/download/${res.id}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.token}` }
      })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a')
      a.href = url; a.download = res.name; a.click()
    },
    formatDate(str) {
      return new Date(str).toLocaleString()
    }
  },
  mounted() {
    this.fetchResources()
  }
}
</script>
