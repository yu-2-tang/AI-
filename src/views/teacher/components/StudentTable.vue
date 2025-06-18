<template>
  <div class="student-table">
    <div class="actions">
      <el-button type="primary" @click="$emit('add')">
        <i class="el-icon-plus"></i> 新增学生
      </el-button>
      <el-button type="success" @click="$emit('import')">
        <i class="el-icon-upload2"></i> 导入
      </el-button>
      <el-button type="warning" @click="$emit('export')">
        <i class="el-icon-download"></i> 导出
      </el-button>
    </div>

    <el-table :data="students" :border="true" style="width: 100%">
      <el-table-column prop="id" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="class" label="班级" />
      <el-table-column prop="major" label="专业" />
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

.actions {
  margin-bottom: 20px;
}
</style>