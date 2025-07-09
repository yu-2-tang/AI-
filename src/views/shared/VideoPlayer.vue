<template>
  <div class="video-player">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="$router.back()">← 返回</button>
    <h2>视频播放</h2>
    
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
    
    <!-- 热力图显示区域 -->
    <div class="heatmap-section" v-if="loaded && !error">
      <div class="heatmap-header">
        <h3>📊 观看热力图</h3>
        <div class="heatmap-controls">
          <button 
            :class="['tab-btn', { active: activeTab === 'segments' }]"
            @click="activeTab = 'segments'"
          >
            片段热力图
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'timeline' }]"
            @click="activeTab = 'timeline'"
          >
            时间轴热力图
          </button>
          <button 
            class="refresh-btn"
            @click="refreshHeatmap"
            :disabled="loadingHeatmap"
          >
            {{ loadingHeatmap ? '🔄' : '🔄 刷新' }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingHeatmap" class="heatmap-loading">
        <div class="loading-spinner small"></div>
        <span>加载热力图数据中...</span>
      </div>

      <!-- 片段热力图 -->
      <div v-else-if="activeTab === 'segments'" class="heatmap-content">
        <div class="heatmap-stats" v-if="heatmapData.stats">
          <div class="stat-item">
            <span class="stat-label">总观看时长:</span>
            <span class="stat-value">{{ formatTime(heatmapData.stats.totalWatchTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">观看覆盖率:</span>
            <span class="stat-value">{{ (heatmapData.stats.coverageRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="stat-item" v-if="heatmapData.stats.hottestSegmentStart !== null">
            <span class="stat-label">最热点:</span>
            <span class="stat-value">{{ formatTime(heatmapData.stats.hottestSegmentStart) }} - {{ formatTime(heatmapData.stats.hottestSegmentEnd) }}</span>
          </div>
        </div>

        <div class="heatmap-visualization">
          <div class="heatmap-timeline" ref="heatmapTimeline">
            <!-- 时间刻度 -->
            <div class="time-scale">
              <div
                v-for="mark in timeMarks"
                :key="mark.time"
                class="time-mark"
                :style="{ left: mark.position + '%' }"
              >
                {{ formatTime(mark.time) }}
              </div>
            </div>
            
            <!-- 热力图条 -->
            <div class="heatmap-bar">
              <div
                v-for="(segment, index) in heatmapData.segments"
                :key="index"
                class="heat-segment"
                :style="{
                  left: (segment.start / videoDuration * 100) + '%',
                  width: ((segment.end - segment.start) / videoDuration * 100) + '%',
                  backgroundColor: getHeatColor(segment.intensity),
                  opacity: 0.7 + segment.intensity * 0.3
                }"
                :title="`${formatTime(segment.start)} - ${formatTime(segment.end)}\n观看次数: ${segment.count}\n热度: ${(segment.intensity * 100).toFixed(1)}%`"
                @click="seekToTime(segment.start)"
              ></div>
            </div>
            
            <!-- 当前播放位置指示器 -->
            <div 
              class="current-position"
              :style="{ left: (currentTime / videoDuration * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 时间轴热力图 -->
      <div v-else-if="activeTab === 'timeline'" class="heatmap-content">
        <div class="timeline-controls">
          <label>时间间隔: </label>
          <select v-model="timelineInterval" @change="fetchTimelineHeatmap">
            <option value="5">5秒</option>
            <option value="10">10秒</option>
            <option value="30">30秒</option>
            <option value="60">1分钟</option>
          </select>
        </div>

        <div class="timeline-heatmap">
          <div class="timeline-grid">
            <div
              v-for="(interval, index) in timelineData.intervals"
              :key="index"
              class="timeline-cell"
              :style="{
                backgroundColor: getHeatColor(interval.intensity),
                opacity: 0.6 + interval.intensity * 0.4
              }"
              :title="`${formatTime(interval.start)} - ${formatTime(interval.end)}\n观看次数: ${interval.count}`"
              @click="seekToTime(interval.start)"
            >
              <span class="cell-time">{{ formatTime(interval.start) }}</span>
              <span class="cell-count">{{ interval.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loadingHeatmap && (!heatmapData.segments || heatmapData.segments.length === 0)" class="heatmap-empty">
        <p>📈 暂无观看数据</p>
        <p class="empty-hint">继续观看视频以生成热力图数据</p>
      </div>
    </div>

    <!-- 原有的加载和错误显示 -->
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
      // 原有状态变量
      taskId: this.$route.query.taskId || '',
      showCompletionDialog: false,
      hasMarkedCompleted: false,
      videoDuration: 0,
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
      progressTimer: null,
      lastWatchedSecond: 0,
      currentTime: 0, // 当前播放时间
      
      // 热力图相关状态
      activeTab: 'segments', // 'segments' | 'timeline'
      heatmapData: {
        duration: 0,
        segments: [],
        stats: null,
        maxCount: 0
      },
      timelineData: {
        intervals: [],
        maxCount: 0
      },
      timelineInterval: 10, // 时间轴间隔（秒）
      loadingHeatmap: false,
      heatmapTimer: null // 热力图刷新定时器
    };
  },
  computed: {
    // 生成时间刻度标记
    timeMarks() {
      if (!this.videoDuration) return [];
      const marks = [];
      const interval = this.videoDuration / 5; // 5个刻度
      for (let i = 0; i <= 5; i++) {
        const time = i * interval;
        marks.push({
          time: time,
          position: (time / this.videoDuration) * 100
        });
      }
      return marks;
    }
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
          // 视频加载完成后获取热力图数据
          this.fetchHeatmapData();
        }, { once: true });
      }
    });

    // 定时保存观看进度，每3秒
    this.progressTimer = setInterval(() => {
      if (this.loaded) this.saveProgress();
    }, 3000);

    // 定时刷新热力图，每30秒
    this.heatmapTimer = setInterval(() => {
      if (this.loaded) this.fetchHeatmapData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.progressTimer) clearInterval(this.progressTimer);
    if (this.heatmapTimer) clearInterval(this.heatmapTimer);
    this.saveProgress();
  },
  methods: {
    // 原有方法...
    async fetchProgress() {
      try {
        const res = await api.get(`/video-progress/${this.resourceId}`);
        if (res) {
          this.lastPosition = res.lastPosition || 0;
          this.totalWatched = res.totalWatched || 0;
          this.segments = res.segments || [];
        }
      } catch (e) {
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

    async saveProgress() {
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
        }
        if (this.segments.length === 0) {
          this.segments.push({
            start: 0,
            end: current,
            count: 1
          });
        }
      }
      try {
        const segmentsToSend = this.segments.slice();
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

    // 热力图相关方法
    async fetchHeatmapData() {
      try {
        this.loadingHeatmap = true;
        const response = await api.get(`/video-progress/${this.resourceId}/heatmap`);
        this.heatmapData = response || {
          duration: 0,
          segments: [],
          stats: null,
          maxCount: 0
        };
        
        // 如果当前是时间轴标签，也获取时间轴数据
        if (this.activeTab === 'timeline') {
          await this.fetchTimelineHeatmap();
        }
      } catch (error) {
        console.error('获取热力图数据失败:', error);
        this.heatmapData = {
          duration: 0,
          segments: [],
          stats: null,
          maxCount: 0
        };
      } finally {
        this.loadingHeatmap = false;
      }
    },

    async fetchTimelineHeatmap() {
      try {
        this.loadingHeatmap = true;
        const response = await api.get(`/video-progress/${this.resourceId}/heatmap/timeline?intervalSeconds=${this.timelineInterval}`);
        this.timelineData = response || {
          intervals: [],
          maxCount: 0
        };
      } catch (error) {
        console.error('获取时间轴热力图数据失败:', error);
        this.timelineData = {
          intervals: [],
          maxCount: 0
        };
      } finally {
        this.loadingHeatmap = false;
      }
    },

    refreshHeatmap() {
      if (this.activeTab === 'segments') {
        this.fetchHeatmapData();
      } else {
        this.fetchTimelineHeatmap();
      }
    },

    // 根据热度强度生成颜色
    getHeatColor(intensity) {
      if (intensity === 0) return '#f0f0f0';
      
      // 从蓝色到红色的渐变
      const colors = [
        '#e3f2fd', // 很低
        '#81c784', // 低
        '#ffb74d', // 中等
        '#ff8a65', // 高
        '#e57373'  // 很高
      ];
      
      const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
      return colors[index];
    },

    // 跳转到指定时间
    seekToTime(time) {
      if (this.$refs.videoRef) {
        this.$refs.videoRef.currentTime = time;
      }
    },

    // 格式化时间显示
    formatTime(seconds) {
      if (!seconds || seconds < 0) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // 原有的视频事件处理方法
    handleLoadStart() {
      this.loading = true;
      this.error = null;
    },
    
    handleLoadedData() {
      this.loading = false;
      this.loaded = true;
      if (this.$refs.videoRef) {
        this.videoDuration = this.$refs.videoRef.duration;
        this.segmentStart = this.$refs.videoRef.currentTime;
        this.lastWatchedSecond = Math.floor(this.$refs.videoRef.currentTime);
        console.log('视频总时长:', this.videoDuration);
      }
    },
    
    handleVideoError(e) {
      this.loading = false;
      let errorMessage = '视频加载失败';
      if (e.target?.error) {
        switch (e.target.error.code) {
          case 1: errorMessage = '视频加载被用户中止'; break;
          case 2: errorMessage = '网络错误或认证失败，无法加载视频'; break;
          case 3: errorMessage = '视频解码失败，文件可能损坏或格式不支持'; break;
          case 4: errorMessage = '不支持的视频格式或无法访问视频源'; break;
          default: errorMessage = `视频错误 (代码: ${e.target.error.code})`;
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
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
        }
      }
      this.saveProgress();
    },
    
    handleTimeUpdate(e) {
      if (!this.loaded) return;
      
      const current = e.target.currentTime;
      this.lastPosition = current;
      this.currentTime = current; // 更新当前时间用于热力图显示
      
      const curSec = Math.floor(current);
      if (curSec > this.lastWatchedSecond) {
        this.totalWatched += (curSec - this.lastWatchedSecond);
        this.lastWatchedSecond = curSec;
        
        if (this.videoDuration > 0 && 
            this.totalWatched >= this.videoDuration * 0.9 &&
            this.taskId) {
          this.markTaskAsCompleted();
        }
      }
      
      if (current - this.segmentStart >= 1) {
        this.segments.push({
          start: this.segmentStart,
          end: current,
          count: 1
        });
        this.segmentStart = current;
      }
    },

    handleVideoEnd() {
      if (this.loaded && this.$refs.videoRef) {
        const current = this.$refs.videoRef.currentTime;
        if (current > this.segmentStart) {
          this.segments.push({
            start: this.segmentStart,
            end: current,
            count: 1
          });
          this.segmentStart = current;
        }
      }
      this.saveProgress();
    },
    
    async retryLoad() {
      this.error = null;
      this.loading = true;
      this.videoUrl = '';
      await this.fetchVideoUrl();
    },

    async markTaskAsCompleted() {
      try {
        await api.put(`/submissions/complete/${this.taskId}`);
        console.log('任务已自动标记为完成');
      } catch (err) {
        console.error('自动标记任务失败:', err);
      }
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

/* 热力图样式 */
.heatmap-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.heatmap-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.heatmap-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-btn:hover:not(.active) {
  background: #f8f9fa;
}

.refresh-btn {
  padding: 8px 12px;
  border: 1px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #28a745;
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.heatmap-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: #666;
}

.heatmap-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.heatmap-visualization {
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  padding: 20px;
}

.heatmap-timeline {
  position: relative;
  height: 80px;
}

.time-scale {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
}

.time-mark {
  position: absolute;
  font-size: 11px;
  color: #666;
  transform: translateX(-50%);
}

.heatmap-bar {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  height: 30px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.heat-segment {
  position: absolute;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  border-right: 1px solid rgba(255,255,255,0.5);
}

.heat-segment:hover {
  opacity: 1 !important;
  transform: scaleY(1.2);
  z-index: 2;
}

.current-position {
  position: absolute;
  top: 25px;
  width: 2px;
  height: 40px;
  background: #ff4757;
  z-index: 3;
  transform: translateX(-50%);
}

/* 时间轴热力图样式 */
.timeline-controls {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-controls label {
  font-weight: 500;
  color: #333;
}

.timeline-controls select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.timeline-heatmap {
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  padding: 20px;
}

.timeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 2px;
}

.timeline-cell {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.1);
}

.timeline-cell:hover {
  transform: scale(1.05);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.cell-time {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
}

.cell-count {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.heatmap-empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-hint {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

/* 原有样式保持不变 */
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

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin: 0;
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

.back-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .heatmap-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .heatmap-controls {
    justify-content: center;
  }
  
  .heatmap-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .timeline-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
}
</style>