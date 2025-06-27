<template>
  <div class="student-resources">
    <h2>我的学习资源</h2>

    <div v-if="resources.length === 0">暂无资源</div>

    <div class="resource-list">
      <div class="resource-card" v-for="res in resources" :key="res.id">
        <h3>{{ res.name }}</h3>
        <p>类型：{{ res.type }}</p>
        <p>上传人：{{ res.uploader }}</p>
        <p>上传时间：{{ formatDate(res.uploadTime) }}</p>

        <div v-if="res.type === 'VIDEO'">
          <video width="100%" controls @timeupdate="updateProgress(res, $event)">
            <source :src="res.url" type="video/mp4" />
            您的浏览器不支持 video 标签。
          </video>
        </div>

        <a v-else :href="res.url" download target="_blank" class="btn primary-btn">下载资源</a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'StudentResources',
  data() {
    return {
      resources: []
    }
  },
  methods: {
    async fetchResources() {
      try {
        const res = await axios.get('/resource/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.resources = res.data.data || []
      } catch (err) {
        console.error('获取资源失败', err)
      }
    },
    updateProgress(resource, event) {
      const current = Math.floor(event.target.currentTime)
      const total = Math.floor(event.target.duration)
      console.log(`资源 ${resource.name} 学习进度：${current} / ${total}`)

      // 可选：向后端发送播放进度
      // axios.post('/resource/progress', {
      //   resourceId: resource.id,
      //   currentTime: current,
      //   totalTime: total
      // })
    },
    formatDate(dateStr) {
      const d = new Date(dateStr)
      return d.toLocaleString()
    }
  },
  mounted() {
    this.fetchResources()
  }
}
</script>

<style scoped>
.student-resources {
  padding: 20px;
}
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.resource-card {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.primary-btn {
  background: #4a90e2;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  margin-top: 10px;
}
</style>
