<template>
  <div class="add-task">
    <h2>发布新任务</h2>

    <div class="form-group">
      <label for="title">任务名称</label>
      <input type="text" v-model="task.title" placeholder="请输入任务名称" required />
    </div>

    <div class="form-group">
      <label for="type">任务类型</label>
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
      <label for="deadline">截止时间</label>
      <input type="date" v-model="task.deadline" required />
    </div>

    <div class="form-group">
      <label for="description">任务描述</label>
      <textarea v-model="task.description" placeholder="任务描述" required></textarea>
    </div>

    <!-- 显示文件上传框，只有在任务类型是EXAM_QUIZ时才显示生成试卷按钮 -->
    <div v-if="task.type !== 'EXAM_QUIZ'">
      <div class="form-group">
        <label for="fileUpload">上传文件</label>
        <input type="file" id="fileUpload" @change="handleFileChange" />
      </div>
    </div>

    <!-- 显示生成试卷按钮，只有在任务类型是EXAM_QUIZ时才显示 -->
    <div v-if="task.type === 'EXAM_QUIZ'">
      <label>选择试卷：</label>
      <input type="file" @change="handleFileChange" />
      <button class="btn primary-btn" @click="goToGenerateExam">上传试卷</button>
    </div>

    <button class="btn primary-btn" @click="saveTask">发布任务</button>
  </div>
</template>

<script>
export default {
  name: 'AddTask',
  data() {
    return {
      task: {
        title: '',
        type: 'CHAPTER_HOMEWORK',
        description: '',
        deadline: '',
        file: null,  // 文件上传
        id: 1,  // 假设任务ID为1，你需要根据实际情况来设置
      }
    };
  },
  methods: {
    handleFileChange(event) {
      this.task.file = event.target.files[0]; // 获取上传的文件
    },

    saveTask() {
      // 确保任务信息完整
      if (this.task.title && this.task.type && this.task.deadline) {
        if (this.task.type === 'EXAM_QUIZ' && !this.task.file) {
          alert('请上传试卷文件！');
          return;
        }
        
        console.log('任务已发布:', this.task);
        
        // 这里可以调用接口提交任务数据以及文件
        // this.submitTask(); // 调用API提交任务
        
        this.$router.push({ name: 'TaskManagement' }); // 发布成功后跳转到任务管理页面
      } else {
        alert('请填写完整任务信息！');
      }
    },

    goToGenerateExam() {
      // 传递task.id作为参数跳转到生成试卷页面
      this.$router.push({ name: 'GenerateExam', params: { id: this.task.id } });
    }
  }
}
</script>

<style scoped>
.add-task {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
}

input,
select,
textarea {
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
}

button:hover {
  background-color: #357ab7;
}
</style>
