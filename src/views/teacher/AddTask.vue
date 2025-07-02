<template>
  <div class="add-task">
    <h2>发布新任务</h2>
    <div v-if="task.type === 'EXAM_QUIZ'" class="btn-group">
      <button @click="goToGenerateExam" class="btn generate-btn">生成试卷</button>
      <button @click="previewExam" class="btn preview-btn" :disabled="!generatedExam">预览试卷</button>
      <button @click="clearGeneratedExam" class="btn delete-btn" :disabled="!generatedExam">删除试卷</button>
    </div>

    <div class="form-group">
      <label>任务名称</label>
      <input type="text" v-model="task.title" placeholder="请输入任务名称" required />
    </div>

    <div class="form-group">
      <label>任务类型</label>
      <select v-model="task.type" required>
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
      <input type="datetime-local" v-model="task.deadline" :min="minDateTime" required />
    </div>

    <div class="form-group">
      <label>任务描述</label>
      <textarea v-model="task.description" placeholder="任务描述"></textarea>
    </div>

    <div v-if="task.type !== 'EXAM_QUIZ'">
      <div class="form-group">
        <label>选择文件 (可多选)</label>
        <input type="file" multiple @change="handleFileChange" />
      </div>

      <div v-if="files.length > 0" class="file-list">
        <h3>已选文件:</h3>
        <ul>
          <li v-for="(file, index) in files" :key="index">
            {{ file.name }}
            <button @click="removeFile(index)" class="remove-btn">×</button>
          </li>
        </ul>
        <button class="btn primary-btn" @click="uploadFiles">确认上传</button>
      </div>

      <div v-if="uploadedResources.length > 0" class="upload-result">
        <h3>已上传资源:</h3>
        <ul>
          <li v-for="(resource, index) in uploadedResources" :key="index">
            {{ resource.name }} (ID: {{ resource.id }})
          </li>
        </ul>
      </div>
    </div>

    <button class="btn primary-btn" @click="saveTask">发布任务</button>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'AddTask',
  data() {
    return {
      task: {
        title: '',
        type: 'CHAPTER_HOMEWORK',
        deadline: '',
        description: '',
        paperId: '' // 新增
      },
      minDateTime: new Date().toISOString().slice(0, 16),
      files: [],
      uploadedResources: [],
      generatedExam: null
    };
  },
  mounted() {
    if (this.$route.query.fromExam === 'true') {
      this.task.type = 'EXAM_QUIZ';
      const exam = localStorage.getItem('generatedExam');
      if (exam) {
        try {
          this.generatedExam = JSON.parse(exam);
          this.task.paperId = this.generatedExam.paperId || '';
        } catch (e) {
          console.warn('解析缓存试卷失败', e);
        }
      }
    }
  },
  methods: {
    previewExam() {
      if (!this.generatedExam) {
        alert('试卷为空，请先生成试卷');
        return;
      }
      if (this.task.paperId) {
        this.$router.push({
          name: 'PreviewExam',
          params: { id: this.task.paperId || 'temp-preview' },
          query: { paperId: this.task.paperId }
        });
      } else {
        this.$router.push({
          name: 'PreviewExam',
          params: { id: 'temp-preview' },
          query: { fromGenerated: 'true' }
        });
      }
    },
    clearGeneratedExam() {
      localStorage.removeItem('generatedExam');
      this.generatedExam = null;
      this.task.paperId = '';
      alert('已清除生成的试卷');
    },
    goToGenerateExam() {
      const courseId = this.$route.params.courseId;
      if (!courseId) {
        alert('课程ID缺失');
        return;
      }
      this.$router.push({ name: 'GenerateExam', params: { courseId } });
    },
    handleFileChange(event) {
      this.files = Array.from(event.target.files);
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    async uploadFiles() {
      if (this.files.length === 0) return alert('请先选择文件');
      const courseId = this.$route.params.courseId;
      if (!courseId) return alert('缺少课程ID');

      try {
        this.uploadedResources = [];
        for (const file of this.files) {
          const form = new FormData();
          form.append('file', file);
          form.append('name', file.name);
          form.append('type', this.getResourceType(file));
          form.append('description', `任务资源: ${this.task.title}`);

          const res = await api.post(
            `/teacher/courses/${courseId}/resources`,
            form,
            {
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          );
          const resource = res.data?.data;
          if (resource) {
            this.uploadedResources.push({
              id: resource.resourceId,
              name: resource.name
            });
          }
        }
        alert('文件上传成功!');
        this.files = [];
      } catch (err) {
        console.error('上传失败', err);
        alert(err.response?.data?.message || err.message || '上传失败');
      }
    },
    getResourceType(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['ppt', 'pptx'].includes(ext)) return 'PPT';
      if (['pdf'].includes(ext)) return 'PDF';
      if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'VIDEO';
      if (['doc', 'docx', 'txt', 'md', 'xls', 'xlsx'].includes(ext)) return 'DOCUMENT';
      if (['jpg', 'png', 'jpeg', 'bmp', 'webp'].includes(ext)) return 'IMAGE';
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)) return 'AUDIO';
      return 'DOCUMENT';
    },
    async saveTask() {
      if (!this.task.title || !this.task.type || !this.task.deadline) {
        alert('请填写完整任务信息');
        return;
      }

      const courseId = this.$route.params.courseId;
      if (!courseId) return alert('缺少课程ID');

      try {
        const payload = {
          ...this.task,
          deadline: this.task.deadline + ':00',
          resourceIds: this.uploadedResources.map(r => r.id),
          pointIds: [],
        };

        if (this.task.type === 'EXAM_QUIZ' && this.generatedExam?.questions) {
          payload.examQuestions = this.generatedExam.questions;
          payload.paperId = this.generatedExam.paperId;
        }

        await api.post(`/teacher/courses/${courseId}/tasks`, payload);
        alert('任务发布成功');
        localStorage.removeItem('generatedExam');
        this.$router.push({ name: 'TaskManagement' });
      } catch (err) {
        console.error('任务发布失败', err);
        alert(err.response?.data?.message || err.message || '任务发布失败');
      }
    }
  }
};
</script>

<style scoped>
.btn-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.preview-btn {
  background-color: #28a745;
}
.preview-btn:hover {
  background-color: #218838;
}
.delete-btn {
  background-color: #dc3545;
}
.delete-btn:hover {
  background-color: #c82333;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.generate-btn {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 5px;
}
.generate-btn:hover {
  background-color: #4a90e2;
}
.add-task {
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  font-weight: bold;
}
input, select, textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
button {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}
button:hover {
  background-color: #357ab7;
}
.file-list, .upload-result {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
}
ul {
  padding-left: 20px;
}
li {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}
.remove-btn {
  padding: 2px 8px;
  background: #ff6b6b;
  margin-left: 10px;
}
.remove-btn:hover {
  background: #ff5252;
}
</style>
