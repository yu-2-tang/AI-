<template>
  <table class="std-table">
    <thead>
      <tr>
        <th>姓名</th><th>专业</th><th>年级</th><th>Email</th><th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="s in students" :key="s.id">
        <td>{{ s.name }}</td>
        <td>{{ s.major }}</td>
        <td>{{ s.year }}</td>
        <td>{{ s.email }}</td>
        <td>
          <button class="btn danger-btn" @click="$emit('delete', s.id)">删除</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'StudentTable',
  props: { students: Array }
}
</script>

<style scoped>
.std-table { width:100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.std-table th, .std-table td { border:1px solid #eee; padding:10px; text-align:left; }

/* ——按钮—— */
.btn { border:none; border-radius:4px; padding:4px 12px; font-size:13px; cursor:pointer; transition:.25s; }
.danger-btn { background:#f56c6c; color:#fff; }
.danger-btn:hover { opacity:.9; }
</style>
