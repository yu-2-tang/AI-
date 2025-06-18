<template>
  <div class="course-table">
    <div class="actions">
      <el-button type="primary" @click="$emit('add')">
        <i class="el-icon-plus"></i> 新增课程
      </el-button>
    </div>

    <el-table :data="courses" :border="true" style="width: 100%">
      <el-table-column prop="code" label="课程编号" width="120" />
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="teacher" label="授课教师" width="120" />
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column prop="hours" label="学时" width="80" />
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
  name: 'CourseTable',
  props: {
    courses: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.course-table {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.actions {
  margin-bottom: 20px;
}
</style>