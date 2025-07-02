<!-- StudentResources.vue -->
<template>
  <div class="student-resources">
    <h2>我的学习资源</h2>
    <div v-if="courses.length === 0">暂无选课</div>

    <div v-for="course in courses" :key="course.courseId" class="course-section">
      <h3>{{ course.name }}（{{ course.courseCode }}）</h3>

      <div v-if="course.resources && course.resources.length">
        <div class="resource-list">
          <div class="resource-card" v-for="res in course.resources" :key="res.resourceId">
            <h4>{{ res.name }}</h4>
            <p>类型：{{ formatResourceType(res.type) }}</p>
            <p>上传人：{{ res.uploader }}</p>
            <p>上传时间：{{ formatDate(res.uploadTime) }}</p>
            <div class="resource-actions">
              <router-link
                v-if="res.type !== 'VIDEO'"
                :to="{ name: 'ResourcePreview', params: { resourceId: res.resourceId } }"
                class="primary-btn"
              >查看</router-link>
              <router-link
                v-else
                :to="{ name: 'VideoPlayer', params: { resourceId: res.resourceId } }"
                class="primary-btn"
              >查看</router-link>
              <button @click="downloadResource(res)" class="primary-btn">下载</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="empty">暂无资源</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios';

export default {
  name: 'StudentResources',
  data() {
    return {
      courses: []
    };
  },
  methods: {
    async fetchCoursesAndResources() {
      try {
        const courseRes = await axios.get('/student/courses', { params: { page: 1, size: 100 } });
        const courseList = courseRes.content || [];

        const courseWithResources = await Promise.all(
          courseList.map(async (course) => {
            try {
              const res = await axios.get(`/student/courses/${course.courseId}/resources`, {
                params: { page: 1, size: 100 }
              });
              course.resources = res.data?.content || [];
            } catch (err) {
              console.error(`获取课程 ${course.name} 的资源失败`, err);
              course.resources = [];
            }
            return course;
          })
        );

        this.courses = courseWithResources;
      } catch (err) {
        console.error('获取选课失败', err);
        alert('加载课程失败');
      }
    },
    async downloadResource(resource) {
      try {
        const token = localStorage.getItem('token')
        const url = `http://localhost:8082/api/student/resources/${resource.resourceId}/download`
        const response = await axios.get(url, {
          responseType: 'blob',
          timeout: 30000,
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });

        if (!response || !response.data || response.data.size === 0) {
          throw new Error('服务器返回空文件或下载失败')
        }

        let fileName = resource.name || `resource_${resource.resourceId}`
        const disposition = response.headers['content-disposition']
        if (disposition) {
          const match = disposition.match(/filename\*=UTF-8''([^;]+)/)
          if (match) fileName = decodeURIComponent(match[1])
        }
        if (!fileName.includes('.')) {
          const extMap = { 'PDF': 'pdf', 'PPT': 'ppt', 'DOCUMENT': 'docx', 'VIDEO': 'mp4', 'IMAGE': 'jpg' }
          fileName += `.${extMap[resource.type?.toUpperCase()] || 'bin'}`
        }

        const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = urlBlob
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(urlBlob)
      } catch (err) {
        console.error('下载失败:', err)
        alert('资源下载失败')
      }
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString();
    },
    formatResourceType(type) {
      const typeMap = {
        'PDF': 'PDF文档',
        'PPT': 'PPT课件',
        'VIDEO': '视频',
        'DOCUMENT': '文档'
      };
      return typeMap[type] || type;
    }
  },
  mounted() {
    this.fetchCoursesAndResources();
  }
};
</script>

<style scoped>
.student-resources {
  padding: 20px;
}
.course-section {
  margin-bottom: 30px;
}
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 10px;
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
.empty {
  color: #888;
  font-style: italic;
}
.resource-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
