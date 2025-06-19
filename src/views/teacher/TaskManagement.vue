<template>
  <div class="task-mgmt">
    <h2>任务管理</h2>

    <div class="action-bar">
      <button class="btn primary-btn" @click="addTask">发布任务</button>
    </div>

    <table class="task-table">
      <thead>
        <tr>
          <th>任务名称</th><th>类型</th><th>截止时间</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>
            <!-- 名称按钮 -->
            <router-link
              :to="`/teacher/tasks/${task.id}`"
              class="btn table-btn"
            >
              {{ task.title }}
            </router-link>
          </td>
          <td>{{ task.type }}</td>
          <td>{{ task.deadline }}</td>
          <td>
            <button class="btn outline-btn" @click="$router.push(`/teacher/tasks/${task.id}`)">查看</button>
            <button class="btn primary-btn" @click="editTask(task.id)">编辑</button>
            <button class="btn danger-btn"  @click="deleteTask(task.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TaskManagement',
  data() {
    return {
      tasks: [
        { id: 1, title: '第一章作业', type: '章节作业', deadline: '2025-06-30' },
        { id: 2, title: '期中测试',   type: '试卷答题', deadline: '2025-07-15' }
      ]
    }
  },
  methods: {
    addTask() { console.log('发布新任务') },
    editTask(id) { console.log('编辑任务', id) },
    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id)
    }
  }
}
</script>

<style scoped>
.task-mgmt { padding: 20px; }
.action-bar { margin-bottom: 15px; }

/* ——表格—— */
.task-table { width:100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,.05);}
.task-table th, .task-table td { border:1px solid #eee; padding:10px; text-align:left; }

/* ——按钮—— */
.btn { border:none; border-radius:4px; padding:4px 12px; font-size:13px; cursor:pointer; transition:.25s; }
.table-btn   { background:#4a90e2; color:#fff; }
.table-btn:hover { opacity:.9; }

.outline-btn { background:transparent; border:1px solid #4a90e2; color:#4a90e2; }
.outline-btn:hover { background:rgba(74,144,226,.1); }

.primary-btn { background:#4a90e2; color:#fff; }
.primary-btn:hover { opacity:.9; }

.danger-btn  { background:#f56c6c; color:#fff; }
.danger-btn:hover { opacity:.9; }

.task-table td button { margin-right:6px; }
</style>
