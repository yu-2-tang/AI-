<template>
  <div class="student-resources">
    <h2>我的学习资源</h2>

    <div v-if="courses.length === 0">暂无选课</div>

    <div v-for="course in courses" :key="course.courseId" class="course-section">
      <h3>{{ course.name }}（{{ course.courseCode }}）</h3>

      <div v-if="course.resources && course.resources.length">
        <div class="resource-list">
          <div class="resource-card" v-for="res in course.resources" :key="res.id">
            <h4>{{ res.name }}</h4>
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
        // 获取已选课程
        const courseRes = await axios.get('/student/courses', { params: { page: 1, size: 100 } });
        const courseList = courseRes.content || [];

        // 为每门课程拉取资源
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
    updateProgress(resource, event) {
      const current = Math.floor(event.target.currentTime);
      const total = Math.floor(event.target.duration);
      console.log(`资源 ${resource.name} 学习进度：${current} / ${total}`);
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString();
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
</style>
