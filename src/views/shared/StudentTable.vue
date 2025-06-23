<template>
  <div class="student-table">
    <el-table :data="students" :border="true" style="width: 100%">
      <el-table-column prop="id" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="major" label="专业" />
      <el-table-column prop="year" label="年级" width="100" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary"
            @click="$emit('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger"
            @click="$emit('delete', scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'StudentTable',
  props: {
    students: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.student-table {
  padding: 20px;
  background: white;
  border-radius: 8px;
}
</style>