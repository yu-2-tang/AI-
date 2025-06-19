<template>
  <table class="course-table">
    <thead>
      <tr>
        <th>课程名称</th><th>课程编号</th><th>学分</th><th>授课教师</th><th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="c in courses" :key="c.id">
        <!-- 课程名称按钮风格 -->
        <td>
          <router-link
            :to="`/teacher/courses/${c.id}`"
            class="btn table-btn"
          >
            {{ c.name }}
          </router-link>
        </td>

        <td>{{ c.code }}</td>
        <td>{{ c.credit }}</td>
        <td>{{ c.teacher }}</td>

        <td class="op-col">
          <button class="btn outline-btn" @click="$router.push(`/teacher/courses/${c.id}`)">查看</button>
          <button class="btn primary-btn" @click="$emit('edit', c.id)">编辑</button>
          <button class="btn danger-btn"  @click="$emit('delete', c.id)">删除</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'CourseTable',
  props: { courses: Array }
}
</script>

<style scoped>
.course-table {
  width: 100%; border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.course-table th, .course-table td {
  border: 1px solid #eee; padding: 10px; text-align: left;
}
/* ———按钮样式——— */
.btn { border: none; border-radius: 4px; padding: 4px 12px; font-size: 13px; cursor: pointer; transition: 0.25s; }
.table-btn   { background: #4a90e2; color:#fff; }
.table-btn:hover { opacity: 0.9; }

.outline-btn { background: transparent; border: 1px solid #4a90e2; color:#4a90e2; }
.outline-btn:hover { background: rgba(74,144,226,.1); }

.primary-btn { background: #4a90e2; color:#fff; }
.primary-btn:hover { opacity: 0.9; }

.danger-btn  { background: #f56c6c; color:#fff; }
.danger-btn:hover { opacity: 0.9; }

.op-col button { margin-right: 6px; }
</style>

