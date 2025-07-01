<template>
  <div class="video-player">
    <h2>视频播放 - {{ videoName }}</h2>
    <video
      ref="videoRef"
      controls
      @timeupdate="handleTimeUpdate"
      @ended="handleVideoEnd"
      width="100%"
      :src="videoUrl"
    ></video>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'VideoPlayer',
  data() {
    return {
      resourceId: this.$route.params.resourceId,
      videoUrl: '',
      videoName: '',
      lastPosition: 0,
      totalWatched: 0,
      segments: [],
      segmentStart: 0,
      segmentEnd: 0,
      loaded: false
    };
  },
  async mounted() {
  await this.fetchVideoUrl();

  try {
    const res = await api.get(`/api/video-progress/${this.resourceId}`);
    this.lastPosition = res.data.lastPosition;
    this.segments = JSON.parse(res.data.heatmapData || '{"segments":[]}').segments || [];
    this.totalWatched = res.data.totalWatched;
    this.loaded = true;

    this.$refs.videoRef.currentTime = this.lastPosition;
    this.segmentStart = this.lastPosition;
  } catch (err) {
    console.warn('获取进度失败，可能是新用户');
    this.loaded = true;
    this.segmentStart = 0;
  }
},
  methods: {
    async fetchVideoUrl() {
      try {
        const res = await api.get(`/teacher/resources/${this.resourceId}`);
        this.videoName = res.data.name;
        this.videoUrl = res.data.url;
      } catch (err) {
        console.error('获取视频信息失败', err);
        alert('视频加载失败');
      }
    },
    async loadProgress() {
      try {
        const res = await api.get(`/video-progress/${this.resourceId}`);
        const progress = res.data;
        this.lastPosition = progress.lastPosition || 0;
        this.totalWatched = progress.totalWatched || 0;
        this.segments = JSON.parse(progress.heatmapData || '{"segments":[]}').segments;
        this.loaded = true;

        this.$refs.videoRef.currentTime = this.lastPosition;
        this.segmentStart = this.lastPosition;
      } catch (err) {
        console.warn('未找到进度记录，将从头开始');
        this.segmentStart = 0;
      }
    },
    handleTimeUpdate(e) {
      if (!this.loaded) return;
      const current = e.target.currentTime;

      // 只记录每5秒一个段落，防止太频繁写入
      if (current - this.segmentStart >= 5) {
        this.segments.push({
          start: this.segmentStart,
          end: current,
          count: 1
        });
        this.segmentStart = current;
      }

      this.totalWatched += 1;
    },
    handleVideoEnd() {
      this.saveProgress();
    },
    async saveProgress() {
      const video = this.$refs.videoRef;
      const current = video.currentTime;

      // 收尾段
      if (current > this.segmentStart) {
        this.segments.push({
          start: this.segmentStart,
          end: current,
          count: 1
        });
      }

      const payload = {
        lastPosition: current,
        totalWatched: this.totalWatched,
        segments: this.segments
      };

      try {
        await api.post(`/video-progress/${this.resourceId}/update`, payload);
        console.log('进度已保存');
      } catch (err) {
        console.error('保存进度失败', err);
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    this.saveProgress().then(() => next());
  }
};
</script>

<style scoped>
.video-player {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
video {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>
