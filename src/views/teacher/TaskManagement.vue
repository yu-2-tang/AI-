<template>
  <div class="task-management">
    <div class="header">
      <h2>任务管理</h2>
      <button @click="showCreateModal = true" class="btn-primary">创建新任务</button>
    </div>
    
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <h3>{{ task.title }}</h3>
        <p>课程: {{ task.course }}</p>
        <p>截止时间: {{ task.deadline }}</p>
        <p>任务类型: {{ task.type }}</p>
        <div class="actions">
          <button @click="editTask(task)" class="btn-edit">编辑</button>
          <button @click="deleteTask(task.id)" class="btn-delete">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h3>创建新任务</h3>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label>任务标题</label>
            <input v-model="newTask.title" required>
          </div>
          <div class="form-group">
            <label>任务类型</label>
            <select v-model="newTask.type" required>
              <option value="homework">章节作业</option>
              <option value="quiz">测试答题</option>
              <option value="video">视频观看</option>
              <option value="reading">资料阅读</option>
              <option value="project">实践项目</option>
            </select>
          </div>
          <div class="form-group">
            <label>截止时间</label>
            <input type="datetime-local" v-model="newTask.deadline" required>
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea v-model="newTask.description"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateModal = false">取消</button>
            <button type="submit">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskManagement',
  data() {
    return {
      tasks: [
        { id: 1, title: '第一章作业', course: '人工智能基础', type: 'homework', deadline: '2023-12-15' },
        { id: 2, title: '期中测试', course: '机器学习', type: 'quiz', deadline: '2023-11-20' }
      ],
      showCreateModal: false,
      newTask: {
        title: '',
        type: '',
        deadline: '',
        description: ''
      }
    }
  },
  methods: {
    createTask() {
      const newId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1
      this.tasks.push({
        id: newId,
        ...this.newTask
      })
      this.showCreateModal = false
      this.resetNewTask()
    },
    editTask(task) {
      // 实现编辑逻辑
      console.log('编辑任务:', task)
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id)
    },
    resetNewTask() {
      this.newTask = {
        title: '',
        type: '',
        deadline: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>
.task-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.task-card h3 {
  margin-top: 0;
  color: #3a7bd5;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary {
  background: #3a7bd5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
   background: #3a7bd5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>