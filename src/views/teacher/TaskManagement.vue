<template>
  <div class="teacher-tasks">
    <h2>我的课程及任务</h2>

    <div v-for="course in courses" :key="course.courseId" class="course-card">
      <h3>{{ course.name }} ({{ course.courseCode }})</h3>
      <p>学期: {{ course.semester }}</p>

      <button class="primary-btn" @click="goToAddTask(course.courseId)">发布任务</button>

      <div v-if="course.tasks.length">
        <h4>已发布任务</h4>
        <table class="task-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>类型</th>
              <th>截止时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="task in course.tasks" :key="task.taskId">
              <tr>
                <td>{{ task.title }}</td>
                <td>{{ task.type }}</td>
                <td>{{ task.deadline }}</td>
                <td class="operation-cell">
  <div class="btn-group">
    <button class="outline-btn" @click="viewTask(task.taskId)">查看</button>
    
    <!-- 占位按钮：当 EXAM_QUIZ 时显示禁用按钮，确保对齐 -->
    <button 
      v-if="task.type !== 'EXAM_QUIZ'" 
      class="outline-btn" 
      @click="downloadTask(task.taskId)"
    >下载</button>
    
    <button 
      v-else 
      class="outline-btn disabled-btn"
      disabled
    >下载</button>

    <button class="primary-btn" @click="openEditModal(course.courseId, task.taskId)">编辑</button>
    <button class="danger-btn" @click="deleteTask(course.courseId, task.taskId)">删除</button>
  </div>

  <div class="btn-group">
    <button
      v-if="['CHAPTER_HOMEWORK', 'REPORT_SUBMISSION', 'EXAM_QUIZ'].includes(task.type)"
      class="outline-btn"
      @click="toggleSubmissions(task)"
    >
      {{ task.showSubmissions ? '隐藏提交' : '查看提交' }}
    </button>
  </div>
</td>

              </tr>

              <!-- 提交记录展示区域 -->
              <tr v-if="task.showSubmissions && ['CHAPTER_HOMEWORK', 'REPORT_SUBMISSION', 'EXAM_QUIZ'].includes(task.type)">
                <td colspan="4">
                  <h5>学生提交列表</h5>
                  <table class="task-table nested">
                    <thead>
                      <tr>
                        <th>学生ID</th>
                        <th>任务类型</th>
                        <th>提交时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="submission in task.submissions" :key="submission.submissionId">
                        <td>{{ submission.studentId }}</td>
                        <td>{{ task.type }}</td>
                        <td>{{ submission.submitTime }}</td>
                        <td>
                          <button class="outline-btn" @click="viewSubmission(submission)">查看</button>
                          <button class="outline-btn" @click="downloadSubmission(submission)">下载</button>
                          <button class="primary-btn" @click="handleGrading(task, submission)">批改</button>
                          <span v-if="submission.graded" style="color: green; margin-left: 8px;">已批改</span>
                        </td>
                      </tr>
                      <tr v-if="!task.submissions || !task.submissions.length">
                        <td colspan="4" style="text-align: center; color: gray;">暂无提交记录</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-else>
        <p>暂无任务</p>
      </div>
    </div>

    <!-- 编辑任务弹窗 -->
    <div class="modal" v-if="editModalVisible">
      <div class="modal-content">
        <h3>编辑任务</h3>
        <div class="form-group">
          <label>任务名称</label>
          <input type="text" v-model="editTask.title" />
        </div>
        <div class="form-group">
          <label>任务类型</label>
          <select v-model="editTask.type">
            <option value="CHAPTER_HOMEWORK">章节作业</option>
            <option value="VIDEO_WATCHING">视频观看</option>
            <option value="MATERIAL_READING">阅读材料</option>
            <option value="PPT_VIEW">PPT浏览</option>
            <option value="REPORT_SUBMISSION">报告上传</option>
            <option value="EXAM_QUIZ">试卷答题</option>
          </select>
        </div>
        <div class="form-group">
          <label>截止时间</label>
          <input type="datetime-local" v-model="editTask.deadline" />
        </div>
        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="editTask.description"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveEditedTask">保存修改</button>
          <button @click="editModalVisible = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import api from '@/axios'
import axios from 'axios'

export default {
  name: 'TeacherTaskManagement',
  data() {
    return {
      courses: [],
      editModalVisible: false,
      editTask: {},
      editingCourseId: null,
      editingTaskId: null
    }
  },
  methods: {
    async toggleSubmissions(task) {
  const allowedTypes = ['CHAPTER_HOMEWORK', 'REPORT_SUBMISSION', 'EXAM_QUIZ'];

  // 双重保险：如果按钮已隐藏，可以不写这个判断，但建议保留防止异常调用
  if (!allowedTypes.includes(task.type)) {
    alert('该任务类型不支持查看提交记录');
    return;
  }

  task.showSubmissions = !task.showSubmissions;

  if (task.showSubmissions && !task.submissions) {
    try {
      const res = await api.get(`/submissions/getSubmissions/${task.taskId}`);

      // 初始化 graded 字段
      const submissions = res.map(sub => ({
        ...sub,
        graded: sub.status === 'graded' // 状态为 graded 时标记
      }));

      this.$set(task, 'submissions', submissions);
    } catch (err) {
      console.error('获取提交列表失败', err);
      alert('加载提交记录失败');
      this.$set(task, 'submissions', []);
    }
  }
},
viewSubmission(submission) {
  const fileId = Array.isArray(submission.fileId) ? submission.fileId[0] : submission.fileId;
  if (!fileId) {
    alert('未上传文件');
    return;
  }
  this.viewResource({ resourceId: fileId, name: '学生提交文件', type: 'DOCUMENT' });
},

downloadSubmission(submission) {
  const fileId = Array.isArray(submission.fileId) ? submission.fileId[0] : submission.fileId;
  if (!fileId) {
    alert('未上传文件');
    return;
  }
  this.downloadResource({ resourceId: fileId, name: '学生提交文件', type: 'DOCUMENT' });
},
async handleGrading(task, submission) {
  if (task.type === 'EXAM_QUIZ') {
    // 获取该学生提交的手动批改题
    try {
      const res = await api.get(`/grading/manual-questions/${submission.submissionId}`);
      const manualQuestions = res;

      if (!manualQuestions || manualQuestions.length === 0) {
        // 没有主观题，自动批改
        if (confirm('无主观题，是否自动批改客观题？')) {
          await api.post(`/grading/auto/${submission.submissionId}`);
          alert('自动批改完成');
submission.graded = true;

        }
      } else {
        // 有主观题，跳转手动批改页面
        this.$router.push({
          name: 'ManualGrading',
          params: { submissionId: submission.submissionId }
        });
      }
    } catch (err) {
      console.error('获取手动批改题失败', err);
      alert('批改初始化失败');
    }
  } else {
    // 章节作业/报告上传
    // 确保任务有maxScore属性
    if (typeof task.maxScore === 'undefined') {
      alert('无法获取任务总分信息');
      return;
    }

    const maxScore = task.maxScore;
    let validScore = false;
    let scoreNum = 0;

    // 使用do-while循环替代while(true)
    do {
      const scoreInput = prompt(`请输入该学生得分（0-${maxScore}分）:`);
      
      // 用户取消输入
      if (scoreInput === null) return;
      
      // 验证输入
      scoreNum = parseFloat(scoreInput);
      
      if (isNaN(scoreNum)) {
        alert('请输入有效的数字');
        continue;
      }
      
      if (scoreNum < 0 || scoreNum > maxScore) {
        alert(`分数必须在0-${maxScore}之间`);
        continue;
      }
      
      validScore = true;
    } while (!validScore);

    try {
      await api.put(`/grading/grade-works`, null, {
        params: {
          submission_id: submission.submissionId,
          grade: scoreNum,
          feedback: '老师手动批改'
        }
      });
      alert('批改成功');
      // 更新当前 submission 状态为已批改
      submission.graded = true;
    } catch (err) {
      console.error('批改失败', err);
      alert('批改失败');
    }
  }
},
    async fetchCoursesAndTasks() {
  try {
    const res = await api.get('/teacher/courses');
    const courses = res.data || [];

    const courseTasksPromises = courses.map(async course => {
      const response = await api.get(`/teacher/courses/${course.courseId}/tasks`);
      const taskList = response?.data || [];

      const tasks = await Promise.all(taskList.map(async task => {
        let submissions = [];
        try {
          const subRes = await api.get(`/submissions/getSubmissions/${task.taskId}`);
          submissions = (subRes || []).map(sub => ({
            ...sub,
            // 判断 grade 字段是否为有效数字以标记已批改状态
            graded: typeof sub.finalGrade === 'number' && !isNaN(sub.finalGrade)
          }));
        } catch (e) {
          console.warn(`获取任务 ${task.taskId} 的提交失败：`, e);
        }

        try {
          const detailRes = await api.get(`/teacher/tasks/${task.taskId}`);
          task.maxScore = detailRes.data.maxScore; // 添加maxScore字段
        } catch (e) {
          console.warn(`获取任务${task.taskId}详情失败:`, e);
          task.maxScore = 100; // 默认值
        }

        return {
          ...task,
          submissions,
          showSubmissions: false
        };
      }));

      return {
        ...course,
        tasks
      };
    });

    this.courses = await Promise.all(courseTasksPromises);
  } catch (err) {
    console.error('加载课程或任务失败', err);
    alert(err.response?.data?.message || '加载失败');
  }
},
    goToAddTask(courseId) {
      this.$router.push({ name: 'AddTask', params: { courseId } })
    },
    // 与ResourceManagement.vue完全一致的查看方法
    async viewTask(taskId) {
      try {
        const res = await api.get(`/teacher/tasks/${taskId}`);
        const task = res.data;

        // 如果是试卷任务，调用新的 paper 接口获取 paperId
        if (task.type === 'EXAM_QUIZ') {
          const paperRes = await api.get(`/paper/task/${taskId}`);
          const paper = paperRes?.data;

          if (!paper || !paper.paperId) {
            alert('未找到绑定的试卷，无法预览');
            return;
          }

          // 跳转到试卷预览页
          this.$router.push({
            name: 'PreviewExam',
            params: { id: taskId },
            query: { paperId: paper.paperId }
          });
          return;
        }

        // 其余类型任务的资源跳转逻辑
        if (!task.resources || task.resources.length === 0) {
          alert('该任务没有关联资源');
          return;
        }

        const resource = task.resources[0];
        this.viewResource(resource);
      } catch (err) {
        console.error('获取任务详情失败:', err);
        alert('加载任务资源失败');
      }
    },
    // 与ResourceManagement.vue完全一致的资源查看方法
    viewResource(resource) {
      // 在控制台输出详细的资源调试信息
      console.group('👁️ 查看资源 - 调试信息');
      console.log('📄 资源对象:', resource);
      console.log('🆔 资源ID:', resource.resourceId);
      console.log('📝 资源名称:', resource.name);
      console.log('🏷️ 原始资源类型:', resource.type);
      console.log('🗂️ MIME类型 (如果有):', resource.mimeType || resource.contentType || '未设置');
      console.log('📊 资源大小:', resource.size, `(${this.formatSize(resource.size)})`);
      console.log('⏰ 上传时间:', resource.uploadTime);
      console.log('🔤 类型字符串长度:', resource.type?.length);
      console.log('📁 文件扩展名:', this.getFileExtension(resource.name));
      console.log('🔍 类型检测结果:');
      
      // 详细的类型判断过程
      const isVideoType1 = resource.type === 'VIDEO';
      const isVideoType2 = resource.type === 'video';
      const isVideoType3 = resource.type?.toLowerCase().startsWith('video/');
      const isVideo = isVideoType1 || isVideoType2 || isVideoType3;
      
      console.log('  📹 resource.type === "VIDEO":', isVideoType1);
      console.log('  📹 resource.type === "video":', isVideoType2);
      console.log('  📹 以"video/"开头:', isVideoType3);
      console.log('  📹 综合判断为视频:', isVideo);
      
      // 增强的文档类型检测
      const isStandardDocType = ['PDF', 'DOCUMENT', 'PPT', 'IMAGE'].includes(resource.type);
      const isPdfMime = resource.type?.toLowerCase().startsWith('application/pdf');
      const isImageMime = resource.type?.toLowerCase().startsWith('image/');
      const isWordMime = resource.type?.toLowerCase().includes('wordprocessingml.document'); // Word文档MIME类型
      const isPptMime = resource.type?.toLowerCase().includes('presentationml.presentation'); // PPT文档MIME类型
      const isExcelMime = resource.type?.toLowerCase().includes('spreadsheetml.sheet'); // Excel文档MIME类型
      const isOfficeDoc = isWordMime || isPptMime || isExcelMime;
      const isPreviewable = isStandardDocType || isPdfMime || isImageMime || isOfficeDoc;
      
      console.log('  📄 在预设类型列表中:', isStandardDocType, ['PDF', 'DOCUMENT', 'PPT', 'IMAGE']);
      console.log('  📄 以"application/pdf"开头:', isPdfMime);
      console.log('  🖼️ 以"image/"开头:', isImageMime);
      console.log('  📝 Word文档MIME类型:', isWordMime);
      console.log('  📊 PPT文档MIME类型:', isPptMime);
      console.log('  📗 Excel文档MIME类型:', isExcelMime);
      console.log('  🏢 Office文档类型:', isOfficeDoc);
      console.log('  📄 综合判断可预览:', isPreviewable);
      
      // 显示可能的MIME类型映射
      if (resource.type) {
        const mimeTypeMapping = this.getMimeTypeInfo(resource.type);
        console.log('  🔄 MIME类型映射信息:', mimeTypeMapping);
      }
      
      let routeAction = '';
      
      // 判断是否为视频类型 - 支持多种视频格式标识
      if (isVideo) {
        routeAction = '跳转到视频播放器';
        console.log('🎬 动作:', routeAction);
        console.log('🛤️ 路由:', 'VideoPlayer');
        console.log('📡 预期后端处理: 视频流处理');
        console.groupEnd();
        this.$router.push({ name: 'VideoPlayer', params: { resourceId: resource.resourceId } });
      } else if (isPreviewable) {
        routeAction = '跳转到资源预览';
        console.log('📖 动作:', routeAction);
        console.log('🛤️ 路由:', 'ResourcePreview');
        
        // 预期的后端处理逻辑
        if (isWordMime || isPptMime || isExcelMime) {
          console.log('📡 预期后端处理: Office文档 -> PDF转换预览');
          console.log('🔧 MIME类型将被PreviewService正确识别并转换');
        } else if (isPdfMime || resource.type === 'PDF') {
          console.log('📡 预期后端处理: PDF直接预览');
        } else if (isImageMime || resource.type === 'IMAGE') {
          console.log('📡 预期后端处理: 图片直接预览');
        } else {
          console.log('📡 预期后端处理: 标准资源类型预览');
        }
        
        console.groupEnd();
        this.$router.push({ name: 'ResourcePreview', params: { resourceId: resource.resourceId } });
      } else {
        routeAction = '显示不支持预览提示';
        console.log('❌ 动作:', routeAction);
        console.log('⚠️ 原因: 资源类型不在支持列表中');
        console.log('💡 建议: 检查resource.type是否为有效的MIME类型或标准类型');
        console.groupEnd();
        alert(`暂不支持预览该资源类型: ${resource.type}`);
      }
    },
    // 与ResourceManagement.vue完全一致的下载方法
    async downloadTask(taskId) {
      try {
        const res = await api.get(`/teacher/tasks/${taskId}`);
        const task = res.data;
        if (!task.resources || task.resources.length === 0) {
          alert('该任务没有关联资源');
          return;
        }
        const resource = task.resources[0];
        this.downloadResource(resource);
      } catch (err) {
        console.error('下载失败:', err);
        alert('任务资源下载失败');
      }
    },
    // 与ResourceManagement.vue完全一致的资源下载方法
    async downloadResource(resource) {
      try {
        const token = localStorage.getItem('token')
        const fullUrl = `http://localhost:8082/api/teacher/resources/${resource.resourceId}/download`
        
        const response = await axios.get(fullUrl, { 
          responseType: 'blob',
          timeout: 30000,
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        })

        if (!response || !response.data) {
          throw new Error('服务器响应异常，未获取到文件数据')
        }
        
        if (response.status && response.status !== 200) {
          throw new Error(`下载失败，状态码: ${response.status}`)
        }

        if (response.data.size === 0) {
          throw new Error('下载的文件大小为0，可能文件不存在或已损坏')
        }

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        
        let fileName = `resource_${resource.resourceId}`
        
        const contentDisposition = response.headers && response.headers['content-disposition']
        if (contentDisposition) {
          const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
          if (utf8Match) {
            fileName = decodeURIComponent(utf8Match[1])
          } else {
            const normalMatch = contentDisposition.match(/filename="?([^";\n]+)"?/)
            if (normalMatch) {
              fileName = normalMatch[1]
            }
          }
        }
        
        if (!fileName || fileName === `resource_${resource.resourceId}`) {
          fileName = resource.name || `resource_${resource.resourceId}`
          
          if (!fileName.includes('.')) {
            let extension = 'pdf'
            
            switch (resource.type?.toUpperCase()) {
              case 'VIDEO':
                extension = 'mp4'
                break
              case 'DOCUMENT':
                extension = 'doc'
                break
              case 'PDF':
                extension = 'pdf'
                break
              case 'PPT':
                extension = 'ppt'
                break
              case 'IMAGE':
                extension = 'jpg'
                break
              default:
                if (resource.url) {
                  const urlExt = resource.url.split('.').pop()
                  if (urlExt && urlExt.length <= 4) {
                    extension = urlExt
                  }
                }
            }
            fileName = `${fileName}.${extension}`
          }
        }
        
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
        
      } catch (err) {
        console.error('下载失败:', err)
        
        let errorMessage = '下载失败'
        
        if (err.response) {
          const status = err.response.status
          
          switch (status) {
            case 404:
              errorMessage = '资源文件不存在'
              break
            case 410:
              errorMessage = '资源文件已被删除'
              break
            case 403:
              errorMessage = '没有权限下载此资源'
              break
            case 401:
              errorMessage = '登录已过期，请重新登录'
              break
            case 500:
              errorMessage = '服务器内部错误'
              break
            default:
              errorMessage = `下载失败 (错误码: ${status})`
          }
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = '下载超时，请重试'
        } else if (err.message) {
          errorMessage = `下载失败: ${err.message}`
        }
        
        alert(errorMessage)
        
        if (err.response && err.response.status === 401) {
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      }
    },
    openEditModal(courseId, taskId) {
      this.editingCourseId = courseId;
      this.editingTaskId = taskId;
      const course = this.courses.find(c => c.courseId === courseId);
      const task = course?.tasks.find(t => t.taskId === taskId);
      this.editTask = { ...task };
      this.editModalVisible = true;
    },
    async saveEditedTask() {
      try {
        await api.put(`/teacher/tasks/${this.editingTaskId}`, this.editTask);
        alert('任务更新成功');
        this.editModalVisible = false;
        this.fetchCoursesAndTasks();
      } catch (err) {
        console.error('任务更新失败', err);
        alert('任务更新失败');
      }
    },
    async deleteTask(courseId, taskId) {
      if (!confirm('确定要删除这个任务吗？')) return;
      try {
        await api.delete(`/teacher/tasks/${taskId}`);
        alert('任务删除成功');
        this.fetchCoursesAndTasks();
      } catch (err) {
        console.error('任务删除失败', err);
        alert(err.response?.data?.message || '删除失败');
      }
    },
    
    // 新增：与ResourceManagement.vue一致的辅助方法
    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    },
    
    getFileExtension(fileName) {
      if (!fileName) return '';
      const lastDot = fileName.lastIndexOf('.');
      return lastDot !== -1 ? fileName.slice(lastDot + 1).toLowerCase() : '';
    },
    
    getMimeTypeInfo(type) {
      const info = {
        originalType: type,
        isStandardType: ['PDF', 'PPT', 'VIDEO', 'DOCUMENT', 'IMAGE'].includes(type),
        isMimeType: type && type.includes('/'),
        category: 'unknown',
        expectedBackendMapping: 'unknown'
      };
      
      if (type) {
        const lowerType = type.toLowerCase();
        
        // 视频类型
        if (lowerType.startsWith('video/') || lowerType === 'video') {
          info.category = 'video';
          info.expectedBackendMapping = 'ResourceType.VIDEO';
        }
        // 图片类型
        else if (lowerType.startsWith('image/')) {
          info.category = 'image';
          info.expectedBackendMapping = 'ResourceType.IMAGE';
        }
        // PDF类型
        else if (lowerType.startsWith('application/pdf')) {
          info.category = 'pdf';
          info.expectedBackendMapping = 'ResourceType.PDF';
        }
        // Word文档
        else if (lowerType.includes('wordprocessingml.document')) {
          info.category = 'word-document';
          info.expectedBackendMapping = 'ResourceType.DOCUMENT (通过mimeTypeToResourceType映射)';
        }
        // PowerPoint
        else if (lowerType.includes('presentationml.presentation')) {
          info.category = 'powerpoint';
          info.expectedBackendMapping = 'ResourceType.PPT (通过mimeTypeToResourceType映射)';
        }
        // Excel
        else if (lowerType.includes('spreadsheetml.sheet')) {
          info.category = 'excel';
          info.expectedBackendMapping = 'ResourceType.DOCUMENT (通过mimeTypeToResourceType映射)';
        }
        // 标准类型
        else if (['PDF', 'PPT', 'VIDEO', 'DOCUMENT', 'IMAGE'].includes(type)) {
          info.category = 'standard-type';
          info.expectedBackendMapping = `ResourceType.${type}`;
        }
      }
      
      return info;
    }
  },
  mounted() {
    this.fetchCoursesAndTasks()
  }
}
</script>

<style scoped>
/* 蓝色边框按钮 */
.outline-btn {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 6px 0;
  border-radius: 4px;
  cursor: pointer;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 蓝色填充按钮 */
.primary-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 0;
  border-radius: 4px;
  cursor: pointer;
  width: 80x;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 红色填充按钮 */
.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 0;
  border-radius: 4px;
  cursor: pointer;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.teacher-tasks {
  padding: 20px;
}

.course-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}



.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  border: 1px solid #eee;
  padding: 8px;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 80px;
}

.task-table.nested {
  margin-top: 10px;
  background-color: #fafafa;
}

.task-table.nested th,
.task-table.nested td {
  border-color: #ddd;
}

/* 按钮整体布局，按钮组左右分开 */
.operation-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 每组按钮内横向排列并保持间距 */
.btn-group {
  display: flex;
  gap: 10px;
}
/* 禁用占位按钮 */
.disabled-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #ccc;
  cursor: not-allowed;
}

/* 所有按钮统一宽度、垂直居中 */


</style>