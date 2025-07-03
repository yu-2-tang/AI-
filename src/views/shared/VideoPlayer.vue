<template>
  <div class="video-player">
    <h2>视频播放 - {{ videoName }}</h2>
    
    <video
      ref="videoRef"
      controls
      @timeupdate="handleTimeUpdate"
      @ended="handleVideoEnd"
      @loadstart="handleLoadStart"
      @loadeddata="handleLoadedData"
      @error="handleVideoError"
      @canplay="handleCanPlay"
      @play="handlePlay"
      @pause="handlePause"
      width="100%"
      :src="videoUrl"
      preload="metadata"
      crossorigin="anonymous"
    ></video>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>视频加载中...</p>
      <p class="loading-details">正在从服务器获取视频流...</p>
    </div>
    <div v-if="error" class="error">
      <h3>❌ 视频加载失败</h3>
      <p>{{ error }}</p>
      <div class="error-details">
        <p><strong>资源ID:</strong> {{ resourceId }}</p>
        <p><strong>视频URL:</strong> {{ videoUrl }}</p>
        <button @click="retryLoad" class="retry-button">🔄 重试加载</button>
        <a :href="`/video-test.html?resourceId=${resourceId}`" target="_blank" class="test-button">🧪 打开测试工具</a>
      </div>
    </div>
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
      loaded: false,
      loading: false,
      error: null,
      progressTimer: null, // 新增定时器引用
      lastWatchedSecond: 0 // 新增：用于 totalWatched 精准递增
    };
  },
  async mounted() {
    if (!this.resourceId) {
      this.error = '缺少资源ID参数';
      return;
    }
    // 1. 先获取上次观看进度
    await this.fetchProgress();

    // 2. 再加载视频
    await this.fetchVideoUrl();

    this.$nextTick(() => {
      if (this.$refs.videoRef) {
        this.$refs.videoRef.addEventListener('loadeddata', () => {
          if (this.lastPosition > 0) {
            this.$refs.videoRef.currentTime = this.lastPosition;
            console.log('断点续播跳转到：', this.lastPosition);
          }
        }, { once: true });
      }
    });

    // 定时保存观看进度，每3秒
    this.progressTimer = setInterval(() => {
      if (this.loaded) this.saveProgress();
    }, 3000);
  },
  beforeUnmount() {
    if (this.progressTimer) clearInterval(this.progressTimer);
    this.saveProgress();
  },
  methods: {
    // 1. 获取上次观看进度
    async fetchProgress() {
      try {
        const res = await api.get(`/video-progress/${this.resourceId}`);
        if (res && res.data) {
          this.lastPosition = res.data.lastPosition || 0;
          this.totalWatched = res.data.totalWatched || 0;
          this.segments = res.data.segments || [];
        }
      } catch (e) {
        // 没有记录也不报错
        this.lastPosition = 0;
        this.totalWatched = 0;
        this.segments = [];
      }
    },

    async fetchVideoUrl() {
      try {
        if (!this.resourceId || this.resourceId === 'undefined' || this.resourceId === 'null') {
          this.error = '无效的资源ID，无法加载视频';
          return;
        }
        
        const res = await api.get(`/teacher/resources/${this.resourceId}`);
        
        let resourceData = res;
        if (res && res.data && typeof res.data === 'object') {
          resourceData = res.data;
        }
        
        if (resourceData) {
          this.videoName = resourceData.name || '未知视频';
        }
        
        const token = localStorage.getItem('token');
        const baseURL = api.defaults.baseURL || 'http://localhost:8082/api';
        
        this.videoUrl = `${baseURL}/teacher/resources/${this.resourceId}/play`;
        
        if (token) {
          this.videoUrl += `?token=${encodeURIComponent(token)}`;
        }
        
      } catch (err) {
        this.error = '视频加载失败: ' + (err.friendlyMessage || err.message || '未知错误');
      }
    },
    
    // 新增：保存观看进度到后端
    async saveProgress() {
      // 终极兜底：segments 为空时强制 push 一段
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
          console.log('saveProgress兜底补最后一段', JSON.stringify(this.segments));
        }
        // 如果 segments 依然为空，强制 push 一段
        if (this.segments.length === 0) {
          this.segments.push({
            start: 0,
            end: current,
            count: 1
          });
          console.log('saveProgress强制补一段', JSON.stringify(this.segments));
        }
      }
      try {
        const segmentsToSend = this.segments.slice();
        console.log('saveProgress segments:', JSON.stringify(segmentsToSend), 'totalWatched:', this.totalWatched);
        await api.post(`/video-progress/${this.resourceId}/update`, {
          lastPosition: this.$refs.videoRef ? this.$refs.videoRef.currentTime : this.lastPosition,
          totalWatched: this.totalWatched,
          segments: segmentsToSend
        });
        this.segments = [];
      } catch (e) {
        console.warn('保存观看进度失败', e);
      }
    },

    handleLoadStart() {
      this.loading = true;
      this.error = null;
    },
    
    handleLoadedData() {
      this.loading = false;
      this.loaded = true;
      if (this.$refs.videoRef) {
        this.segmentStart = this.$refs.videoRef.currentTime;
        this.lastWatchedSecond = Math.floor(this.$refs.videoRef.currentTime);
        console.log('handleLoadedData: segmentStart 初始化为', this.segmentStart);
      }
    },
    
    handleVideoError(e) {
      this.loading = false;
      
      let errorMessage = '视频加载失败';
      if (e.target?.error) {
        switch (e.target.error.code) {
          case 1:
            errorMessage = '视频加载被用户中止';
            break;
          case 2:
            errorMessage = '网络错误或认证失败，无法加载视频';
            break;
          case 3:
            errorMessage = '视频解码失败，文件可能损坏或格式不支持';
            break;
          case 4:
            errorMessage = '不支持的视频格式或无法访问视频源';
            break;
          default:
            errorMessage = `视频错误 (代码: ${e.target.error.code})`;
        }
      }
      
      this.error = errorMessage;
    },
    
    handleCanPlay() {
      this.loading = false;
    },
    
    handlePlay() {
      // 视频开始播放
    },
    
    handlePause() {
      // 补最后一段
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
          console.log('pause补最后一段', this.segments);
        }
      }
      this.saveProgress();
    },
    
    handleTimeUpdate(e) {
      if (!this.loaded) {
        console.log('未加载完成，跳过timeupdate');
        return;
      }
      const current = e.target.currentTime;
      this.lastPosition = current;
      // 只在整秒递增 totalWatched
      const curSec = Math.floor(current);
      if (curSec > this.lastWatchedSecond) {
        this.totalWatched += (curSec - this.lastWatchedSecond);
        this.lastWatchedSecond = curSec;
        console.log('totalWatched递增', this.totalWatched);
      }
      // 分段统计：每超过1秒 push 一段
      if (current - this.segmentStart >= 1) {
        this.segments.push({
          start: this.segmentStart,
          end: current,
          count: 1
        });
        this.segmentStart = current;
        console.log('push segment', this.segments);
      }
    },

    handleVideoEnd() {
      // 补最后一段
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
          console.log('end补最后一段', this.segments);
        }
      }
      this.saveProgress();
    },
    
    setupVideoAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        // 没有找到认证token
      }
    },
    
    async retryLoad() {
      this.error = null;
      this.loading = true;
      this.videoUrl = '';
      
      await this.fetchVideoUrl();
    }  
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
.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-details {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

.error {
  text-align: center;
  padding: 30px 20px;
  color: #c62828;
  font-size: 16px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  margin-top: 20px;
}

.error h3 {
  margin: 0 0 15px 0;
  color: #c62828;
}

.error-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  text-align: left;
}

.error-details p {
  margin: 8px 0;
  word-break: break-all;
  color: #666;
}

.retry-button {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.test-button {
  display: inline-block;
  margin-top: 15px;
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #f39c12;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.test-button:hover {
  background-color: #e67e22;
}
</style>