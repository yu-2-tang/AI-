<template>
  <div class="student-grades">
    <h2>我的课程与任务成绩</h2>

    <div v-for="course in courseList" :key="course.courseId" class="course-block">
      <h3>{{ course.name }}（{{ course.courseCode }}）</h3>
      <p>学期：{{ course.semester }}</p>

      <h4>任务成绩</h4>
      <ul v-if="course.tasks && course.tasks.length">
        <li v-for="task in course.tasks" :key="task.taskId">
          {{ task.title }}：{{ task.statusText }}
        </li>
      </ul>
      <p v-else>暂无任务</p>

      <!-- 成绩趋势图 -->
      <h4>成绩趋势</h4>
      <div v-if="course.gradeTrend && course.gradeTrend.scores && course.gradeTrend.scores.length"
        :id="'chart-' + course.courseId" class="grade-trend-chart"></div>
      <p v-else>未做过任务，暂无成绩</p>

      <h4>课程反馈</h4>
      <p style="white-space: pre-wrap;">{{ course.feedback || '暂无反馈' }}</p>

      <!-- AI学习推荐 -->
      <h4>
        AI学习推荐
        <button @click="loadRecommendations(course.courseId)" 
                :disabled="course.loadingRecommendations"
                class="refresh-btn">
          {{ course.loadingRecommendations ? '加载中...' : '刷新推荐' }}
        </button>
      </h4>
      
      <div v-if="course.loadingRecommendations" class="loading-recommendations">
        <div class="loading-spinner"></div>
        <p>AI正在分析您的学习情况，生成个性化推荐...</p>
      </div>

      <div v-else-if="course.recommendations" class="recommendations-container">
        <!-- 推荐选项卡 -->
        <div class="recommendation-tabs">
          <button 
            v-for="tab in recommendationTabs" 
            :key="tab.key"
            :class="['tab-btn', { active: course.activeTab === tab.key }]"
            @click="setActiveTab(course.courseId, tab.key)">
            {{ tab.label }}
          </button>
        </div>

        <!-- 知识点推荐 -->
        <div v-if="course.activeTab === 'knowledge'" class="recommendation-content">
          <div v-if="course.recommendations.knowledgePointRecommendations && course.recommendations.knowledgePointRecommendations.length" class="knowledge-recommendations">
            <div v-for="kp in course.recommendations.knowledgePointRecommendations" :key="kp.pointId" class="knowledge-item">
              <div class="knowledge-header">
                <h5>{{ kp.name }}</h5>
                <span class="priority-badge" :class="getPriorityClass(kp.priority)">
                  {{ getPriorityText(kp.priority) }}
                </span>
              </div>
              <p class="knowledge-description">{{ kp.description }}</p>
              <div class="knowledge-stats">
                <span class="mastery-level">掌握程度: {{ kp.masteryLevel }}%</span>
                <span class="difficulty">难度: {{ getDifficultyText(kp.difficultyLevel) }}</span>
                <span class="resources">相关资源: {{ kp.relatedResourceCount }}个</span>
              </div>
              <p class="recommendation-reason">{{ kp.reason }}</p>
            </div>
          </div>
          <p v-else class="no-data">暂无知识点推荐</p>
        </div>

        <!-- 资源推荐 -->
        <div v-if="course.activeTab === 'resources'" class="recommendation-content">
          <div v-if="course.recommendations.resourceRecommendations && course.recommendations.resourceRecommendations.length" class="resource-recommendations">
            <div v-for="resource in course.recommendations.resourceRecommendations" :key="resource.resourceId" class="resource-item">
              <div class="resource-header">
                <h5>{{ resource.name }}</h5>
                <span class="resource-type" :class="getResourceTypeClass(resource.type)">
                  {{ getResourceTypeText(resource.type) }}
                </span>
              </div>
              <p class="resource-description">{{ resource.description }}</p>
              <div class="resource-stats">
                <span class="priority">优先级: {{ resource.priority }}</span>
                <span class="view-count">浏览量: {{ resource.viewCount }}</span>
                <span class="file-size" v-if="resource.size">大小: {{ formatFileSize(resource.size) }}</span>
              </div>
              <p class="recommendation-reason">{{ resource.reason }}</p>
              <div class="resource-actions">
                <button @click="viewResource(resource.url)" class="view-btn">查看资源</button>
              </div>
            </div>
          </div>
          <p v-else class="no-data">暂无资源推荐</p>
        </div>

        <!-- 综合建议 -->
        <div v-if="course.activeTab === 'comprehensive'" class="recommendation-content">
          <div class="comprehensive-recommendation">
            <div class="learning-status">
              <h5>学习状态分析</h5>
              <div class="status-card">
                <div class="status-item">
                  <span class="label">当前成绩:</span>
                  <span class="value">{{ course.recommendations.currentGrade || '暂无' }}分</span>
                </div>
                <div class="status-item">
                  <span class="label">班级排名:</span>
                  <span class="value">{{ course.recommendations.classRank || '暂无' }}</span>
                </div>
                <div class="status-item" v-if="course.recommendations.learningStatus">
                  <span class="label">学习状态:</span>
                  <span class="value">{{ course.recommendations.learningStatus }}</span>
                </div>
                <div class="status-item" v-if="course.recommendations.expectedImprovement">
                  <span class="label">预期提升:</span>
                  <span class="value">{{ course.recommendations.expectedImprovement }}分</span>
                </div>
              </div>
            </div>

            <div class="learning-path" v-if="course.recommendations.learningPath">
              <h5>推荐学习路径</h5>
              <div class="path-content">
                <p style="white-space: pre-wrap;">{{ course.recommendations.learningPath }}</p>
              </div>
            </div>

            <div class="ai-suggestion">
              <h5>AI综合建议</h5>
              <div class="suggestion-content">
                <p style="white-space: pre-wrap;">{{ course.recommendations.overallSuggestion }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="recommendation-footer">
          <p class="generation-time">
            推荐生成时间: {{ course.recommendations.generatedTime }}
          </p>
        </div>
      </div>

      <div v-else-if="course.recommendationError" class="recommendation-error">
        <p>{{ course.recommendationError }}</p>
        <button @click="loadRecommendations(course.courseId)" class="retry-btn">重试</button>
      </div>

      <div v-else class="no-recommendations">
        <p>暂无推荐内容，点击上方按钮获取AI推荐</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'
import * as echarts from 'echarts'; // 引入echarts

export default {
  name: 'StudentGradesView',
  data() {
    return {
      courseList: [],
      chartInstances: {}, // 存储图表实例
      recommendationTabs: [
        { key: 'knowledge', label: '知识点推荐' },
        { key: 'resources', label: '资源推荐' },
        { key: 'comprehensive', label: '综合建议' }
      ]
    }
  },
  methods: {
    // 设置活跃的推荐选项卡
    setActiveTab(courseId, tabKey) {
      const course = this.courseList.find(c => c.courseId === courseId);
      if (course) {
        course.activeTab = tabKey;
      }
    },

    // 加载推荐内容
    async loadRecommendations(courseId) {
      const course = this.courseList.find(c => c.courseId === courseId);
      if (!course) return;

      course.loadingRecommendations = true;
      course.recommendationError = null;

      try {
        // 获取综合推荐
        const response = await axios.get('/recommendation/comprehensive', {
          params: { courseId }
        });

        if (response.data && response.data.code === 200) {
          course.recommendations = response.data.data;
          course.activeTab = course.activeTab || 'knowledge';
        } else {
          course.recommendationError = response.data?.message || '获取推荐失败';
        }
      } catch (error) {
        console.error('获取推荐失败:', error);
        course.recommendationError = error.response?.data?.message || '网络错误，请稍后重试';
      } finally {
        course.loadingRecommendations = false;
      }
    },

    // 获取优先级样式类
    getPriorityClass(priority) {
      switch(priority) {
        case 'HIGH': return 'priority-high';
        case 'MEDIUM': return 'priority-medium';
        case 'LOW': return 'priority-low';
        default: return 'priority-medium';
      }
    },

    // 获取优先级文本
    getPriorityText(priority) {
      switch(priority) {
        case 'HIGH': return '高优先级';
        case 'MEDIUM': return '中优先级';
        case 'LOW': return '低优先级';
        default: return '中优先级';
      }
    },

    // 获取难度文本
    getDifficultyText(difficulty) {
      switch(difficulty) {
        case 'EASY': return '简单';
        case 'MEDIUM': return '中等';
        case 'HARD': return '困难';
        default: return '中等';
      }
    },

    // 获取资源类型样式类
    getResourceTypeClass(type) {
      switch(type) {
        case 'VIDEO': return 'type-video';
        case 'PDF': return 'type-pdf';
        case 'DOCUMENT': return 'type-document';
        case 'PPT': return 'type-ppt';
        default: return 'type-default';
      }
    },

    // 获取资源类型文本
    getResourceTypeText(type) {
      switch(type) {
        case 'VIDEO': return '视频';
        case 'PDF': return 'PDF';
        case 'DOCUMENT': return '文档';
        case 'PPT': return 'PPT';
        default: return '其他';
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 查看资源
    viewResource(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    // 渲染趋势图
    renderGradeTrendChart(courseId, trendData) {
      const chartDom = document.getElementById(`chart-${courseId}`);
      if (!chartDom) return;

      // 销毁旧实例（如果存在）
      if (this.chartInstances[courseId]) {
        this.chartInstances[courseId].dispose();
      }

      const chart = echarts.init(chartDom);
      this.chartInstances[courseId] = chart;

      // 计算得分率而不是使用绝对分数
      const scoreRates = trendData.scores.map((score, index) => {
        const totalScore = trendData.totalScores ? trendData.totalScores[index] : 100;
        return totalScore > 0 ? Math.round((score / totalScore) * 100 * 100) / 100 : 0;
      });

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const data = params[0];
            const index = data.dataIndex;
            const actualScore = trendData.scores[index];
            const totalScore = trendData.totalScores ? trendData.totalScores[index] : 100;
            const taskName = trendData.taskNames ? trendData.taskNames[index] : data.name;
            return `任务: ${taskName}<br/>得分率：${data.value}%<br/>实际得分：${actualScore}/${totalScore}分`;
          }
        },
        xAxis: {
          type: 'category',
          data: trendData.taskNames || trendData.dates, // 优先使用任务名称，如果没有则使用日期
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '得分率 (%)',
          min: 0,
          max: 100,
          interval: 10
        },
        series: [{
          name: '得分率',
          type: 'line',
          data: scoreRates,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#1890ff'
          },
          itemStyle: {
            color: '#1890ff'
          },
          markPoint: {
            data: [
              { type: 'max', name: '最高得分率' },
              { type: 'min', name: '最低得分率' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均得分率' }
            ]
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        }],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          containLabel: true
        }
      };

      chart.setOption(option);

      // 响应窗口变化
      window.addEventListener('resize', () => {
        chart.resize();
      });
    }
  },
  async mounted() {
    try {
      const courseRes = await axios.get('/student/courses', {
        params: { page: 1, size: 10 }
      })
      const courses = courseRes?.content || []

      // 使用Promise.allSettled确保单个课程错误不会中断整个流程
      const coursePromises = courses.map(async course => {
        try {
          // 获取任务列表
          const taskRes = await axios.get(`/teacher/courses/${course.courseId}/tasks`)
          const tasks = taskRes?.data || []

          // 获取提交记录
          let submissions = []
          try {
            const subRes = await axios.get(
              `/submissions/get_submissions_of_course/${course.courseId}`
            )
            submissions = subRes || []
          } catch (e) {
            console.warn(`获取课程 ${course.name} 提交记录失败:`, e)
          }

          // 匹配任务成绩
          const scoredTasks = tasks.map(task => {
            const submission = submissions.find(sub => sub.taskId === task.taskId)
            let statusText = '未提交'
            if (submission) {
              statusText = submission.finalGrade !== null ? `${submission.finalGrade} 分` : '未批改'
            }

            return {
              ...task,
              myScore: submission?.finalGrade ?? null,
              statusText
            }
          })

          // 获取课程反馈
          let feedback = ''
          try {
            const response = await axios.get(`/feedback/${course.courseId}`)
            feedback = response || ''
          } catch (error) {
            if (error.response?.status === 400 &&
              error.response.data?.message?.includes('Grade not found')) {
              feedback = ''
            } else {
              console.error(`获取课程 ${course.name} 反馈失败:`, error)
              feedback = '获取反馈失败'
            }
          }

          // 获取成绩趋势数据
          let gradeTrend = null;
          try {
            const gradeRes = await axios.get(`/grades/course/${course.courseId}/student`)
            if (gradeRes && gradeRes.gradeTrend) {
              gradeTrend = JSON.parse(gradeRes.gradeTrend);
              console.log(`课程 ${course.name} 成绩趋势数据:`, gradeTrend);
            }
          } catch (error) {
            if (error.response?.status === 404) {
              console.log(`课程 ${course.name} 暂无成绩数据`)
            } else {
              console.error(`获取课程 ${course.name} 成绩趋势失败:`, error)
            }
          }

          return {
            ...course,
            tasks: scoredTasks,
            feedback: feedback,
            gradeTrend: gradeTrend,
            // 推荐相关字段
            recommendations: null,
            loadingRecommendations: false,
            recommendationError: null,
            activeTab: 'knowledge'
          }
        } catch (courseError) {
          console.error(`处理课程 ${course.name} 时出错:`, courseError)
          return {
            ...course,
            tasks: [],
            feedback: '数据加载失败',
            gradeTrend: null,
            recommendations: null,
            loadingRecommendations: false,
            recommendationError: null,
            activeTab: 'knowledge'
          }
        }
      })

      // 等待所有课程处理完成
      const results = await Promise.allSettled(coursePromises)

      // 提取成功的课程数据
      this.courseList = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)

      // 渲染所有趋势图
      this.$nextTick(() => {
        this.courseList.forEach(course => {
          if (course.gradeTrend && course.gradeTrend.scores && course.gradeTrend.scores.length) {
            this.renderGradeTrendChart(course.courseId, course.gradeTrend)
          }
        })
      })

    } catch (err) {
      console.error('加载课程与成绩失败:', err)
    }
  }
}
</script>

<style scoped>
.student-grades {
  padding: 20px;
}

.course-block {
  background: #f9f9f9;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 6px;
  position: relative;
}

.course-block h3 {
  margin-bottom: 8px;
}

.course-block ul {
  margin-left: 20px;
}

.course-block li {
  margin-bottom: 6px;
}

/* 图表样式 */
.grade-trend-chart {
  height: 350px;
  margin: 15px 0;
}

/* 推荐内容样式 */
.refresh-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
}

.refresh-btn:hover {
  background: #40a9ff;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-recommendations {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendations-container {
  margin-top: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: white;
}

.recommendation-tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 6px 6px 0 0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: white;
}

.tab-btn:hover {
  color: #1890ff;
}

.recommendation-content {
  padding: 15px;
}

.knowledge-recommendations, .resource-recommendations {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.knowledge-item, .resource-item {
  background: #fafafa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.knowledge-header, .resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.knowledge-header h5, .resource-header h5 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.priority-high {
  background: #ff4d4f;
  color: white;
}

.priority-medium {
  background: #faad14;
  color: white;
}

.priority-low {
  background: #52c41a;
  color: white;
}

.resource-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.type-video {
  background: #722ed1;
  color: white;
}

.type-pdf {
  background: #eb2f96;
  color: white;
}

.type-document {
  background: #13c2c2;
  color: white;
}

.type-ppt {
  background: #fa8c16;
  color: white;
}

.type-default {
  background: #595959;
  color: white;
}

.knowledge-description, .resource-description {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
}

.knowledge-stats, .resource-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.knowledge-stats span, .resource-stats span {
  font-size: 12px;
  color: #999;
}

.mastery-level {
  color: #1890ff !important;
  font-weight: bold;
}

.recommendation-reason {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.resource-actions {
  display: flex;
  gap: 10px;
}

.view-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.view-btn:hover {
  background: #40a9ff;
}

.comprehensive-recommendation {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.learning-status h5, .learning-path h5, .ai-suggestion h5 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.status-card {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
}

.status-item .label {
  color: #666;
  font-weight: bold;
}

.status-item .value {
  color: #1890ff;
  font-weight: bold;
}

.path-content, .suggestion-content {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.recommendation-footer {
  padding: 10px 15px;
  background: #f5f5f5;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}

.generation-time {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.recommendation-error {
  text-align: center;
  padding: 20px;
  color: #ff4d4f;
}

.retry-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background: #ff7875;
}

.no-recommendations, .no-data {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
