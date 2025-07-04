<template>
  <div class="student-grades">
    <h2>我的课程与任务成绩</h2>

    <div v-for="course in courseList" :key="course.courseId" class="course-block">
      <h3>{{ course.name }}（{{ course.courseCode }}）</h3>
      <p>学期：{{ course.semester }}</p>

      <h4>任务成绩</h4>
      <ul v-if="course.tasks && course.tasks.length">
        <li v-for="task in course.tasks" :key="task.taskId">
          {{ task.title }}：{{ task.myScore !== null ? task.myScore + ' 分' : '未提交或未批改' }}
        </li>
      </ul>
      <p v-else>暂无任务</p>

      <!-- 成绩趋势图 -->
      <h4>成绩趋势</h4>
      <div v-if="course.gradeTrend && course.gradeTrend.scores && course.gradeTrend.scores.length" 
           :id="'chart-'+course.courseId" 
           class="grade-trend-chart"></div>
      <p v-else>未做过任务，暂无成绩</p>

      <h4>课程反馈</h4>
      <p style="white-space: pre-wrap;">{{ course.feedback || '暂无反馈' }}</p>
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
      chartInstances: {} // 存储图表实例
    }
  },
  methods: {
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
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0];
            return `${data.name}<br/>分数：${data.value}分`;
          }
        },
        xAxis: {
          type: 'category',
          data: trendData.dates,
          axisLabel: {
            rotate: 45, // 如果日期太长可以旋转45度
            interval: 0 // 强制显示所有标签
          }
        },
        yAxis: {
          type: 'value',
          name: '分数',
          min: 0,
          max: 100,
          interval: 10
        },
        series: [{
          name: '成绩',
          type: 'line',
          data: trendData.scores,
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
              { type: 'max', name: '最高分' },
              { type: 'min', name: '最低分' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均分' }
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
          bottom: '12%', // 为旋转的标签留出空间
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
            const submission = submissions.find(
              sub => sub.taskId === task.taskId
            )
            return {
              ...task,
              myScore: submission?.finalGrade ?? null
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
              // 直接使用返回的对象，不需要解析
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
            gradeTrend: gradeTrend // 添加成绩趋势数据
          }
        } catch (courseError) {
          console.error(`处理课程 ${course.name} 时出错:`, courseError)
          return {
            ...course,
            tasks: [],
            feedback: '数据加载失败',
            gradeTrend: null
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
  },
  beforeDestroy() {
    // 销毁所有图表实例
    Object.values(this.chartInstances).forEach(chart => {
      chart.dispose();
    });
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
</style>