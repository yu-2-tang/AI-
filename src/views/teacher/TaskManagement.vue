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
            <tr v-for="task in course.tasks" :key="task.taskId">
              <td>{{ task.title }}</td>
              <td>{{ task.type }}</td>
              <td>{{ task.deadline }}</td>
              <td>
                <button class="outline-btn" @click="viewTask(task.taskId)">查看</button>
                <button class="outline-btn" @click="downloadTask(task.taskId)">下载</button>
                <button class="primary-btn" @click="openEditModal(course.courseId, task.taskId)">编辑</button>
                <button class="danger-btn" @click="deleteTask(course.courseId, task.taskId)">删除</button>
              </td>
            </tr>
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
import axios from '@/axios'

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
    async fetchCoursesAndTasks() {
      try {
        const res = await axios.get('/teacher/courses')
        const courses = res.data || []

        const courseTasksPromises = courses.map(async course => {
          const taskRes = await axios.get(`/teacher/courses/${course.courseId}/tasks`)
          return {
            ...course,
            tasks: taskRes.data || []
          }
        })

        this.courses = await Promise.all(courseTasksPromises)
      } catch (err) {
        console.error('加载课程或任务失败', err)
        alert(err.response?.data?.message || '加载失败')
      }
    },
    goToAddTask(courseId) {
      this.$router.push({ name: 'AddTask', params: { courseId } })
    },
    async viewTask(taskId) {
      try {
        const res = await axios.get(`/teacher/tasks/${taskId}`);
        const task = res.data;
        if (!task.resources || task.resources.length === 0) {
          alert('该任务没有关联资源');
          return;
        }
        const resource = task.resources[0];
        const resourceId = resource.resourceId;
        switch (resource.type) {
          case 'VIDEO':
            this.$router.push({ name: 'VideoPlayer', params: { resourceId } });
            break;
          case 'PPT':
          case 'PDF':
          case 'DOCUMENT':
            this.$router.push({ name: 'ResourcePreview', params: { resourceId } });
            break;
          default:
            alert(`暂不支持预览资源类型: ${resource.type}`);
        }
      } catch (err) {
        console.error('获取任务详情失败:', err);
        alert('加载任务资源失败');
      }
    },
    async downloadTask(taskId) {
      try {
        const res = await axios.get(`/teacher/tasks/${taskId}`);
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
    async downloadResource(resource) {
      try {
        const token = localStorage.getItem('token');
        const fullUrl = `http://localhost:8082/api/teacher/resources/${resource.resourceId}/download`;
        const response = await axios.get(fullUrl, {
          responseType: 'blob',
          headers: { 'Authorization': token ? `Bearer ${token}` : undefined }
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        let fileName = resource.name || `resource_${resource.resourceId}`;
        if (!fileName.includes('.')) fileName += '.pdf';
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('下载失败:', err);
        alert('资源下载失败');
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
        await axios.put(`/teacher/tasks/${this.editingTaskId}`, this.editTask);
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
        await axios.delete(`/teacher/tasks/${taskId}`);
        alert('任务删除成功');
        this.fetchCoursesAndTasks();
      } catch (err) {
        console.error('任务删除失败', err);
        alert(err.response?.data?.message || '删除失败');
      }
    }
  },
  mounted() {
    this.fetchCoursesAndTasks()
  }
}
</script>

<style scoped>
.teacher-tasks {
  padding: 20px;
}
.course-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.primary-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
}
.task-table th, .task-table td {
  border: 1px solid #eee;
  padding: 8px;
}
.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.outline-btn {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
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
.teacher-tasks {
  padding: 20px;
}
.course-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.primary-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
}
.task-table th, .task-table td {
  border: 1px solid #eee;
  padding: 8px;
}
.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.outline-btn {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
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
</style>
