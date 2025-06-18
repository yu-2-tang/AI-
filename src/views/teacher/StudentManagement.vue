<template>
  <div class="student-management">
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        新增学生
      </el-button>
      <el-button type="success" icon="el-icon-upload" @click="showImportDialog">
        批量导入
      </el-button>
      <el-button type="warning" icon="el-icon-download" @click="exportStudents">
        导出数据
      </el-button>
    </div>

    <!-- 学生表格 - 修改了border和align的写法 -->
    <el-table 
      :data="studentList" 
      v-bind="tableProps"  <!-- 使用对象绑定所有表格属性 -->
      style="width: 100%"
      height="calc(100vh - 220px)">
      
      <el-table-column prop="id" label="学号" width="120" header-align="center" align="center"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120" header-align="center" align="center"></el-table-column>
      <el-table-column prop="gender" label="性别" width="80" header-align="center" align="center">
        <template #default="{row}">
          <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small">
            {{ row.gender }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="className" label="班级" header-align="center"></el-table-column>
      <el-table-column prop="major" label="专业" header-align="center"></el-table-column>
      <el-table-column label="操作" width="180" header-align="center" align="center" fixed="right">
        <template #default="{row}">
          <el-button size="mini" type="primary" @click="editStudent(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="deleteStudent(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="studentForm" label-width="80px">
        <el-form-item label="学号" required>
          <el-input v-model="studentForm.id"></el-input>
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="studentForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-select v-model="studentForm.gender" style="width: 100%">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" required>
          <el-input v-model="studentForm.className"></el-input>
        </el-form-item>
        <el-form-item label="专业" required>
          <el-input v-model="studentForm.major"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StudentManagement',
  data() {
    return {
      // 表格属性统一配置
      tableProps: {
        border: true,    // 使用正确的布尔值绑定
        stripe: true,
        fit: true
      },
      studentList: [
        {
          id: '20230001',
          name: '张三',
          gender: '男',
          className: '计算机1班',
          major: '计算机科学与技术'
        },
        {
          id: '20230002',
          name: '李四',
          gender: '女',
          className: '计算机2班',
          major: '软件工程'
        }
      ],
      dialogVisible: false,
      dialogTitle: '新增学生',
      studentForm: {
        id: '',
        name: '',
        gender: '男',
        className: '',
        major: ''
      }
    }
  },
  methods: {
    showAddDialog() {
      this.dialogTitle = '新增学生'
      this.studentForm = {
        id: '',
        name: '',
        gender: '男',
        className: '',
        major: ''
      }
      this.dialogVisible = true
    },
    editStudent(student) {
      this.dialogTitle = '编辑学生'
      this.studentForm = { ...student }
      this.dialogVisible = true
    },
    deleteStudent(id) {
      this.$confirm('确定删除该学生吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.studentList = this.studentList.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
    },
    submitForm() {
      if (this.dialogTitle === '新增学生') {
        this.studentList.unshift({ ...this.studentForm })
      } else {
        const index = this.studentList.findIndex(item => item.id === this.studentForm.id)
        this.studentList.splice(index, 1, { ...this.studentForm })
      }
      this.dialogVisible = false
      this.$message.success('操作成功')
    },
    showImportDialog() {
      this.$message.info('导入功能开发中')
    },
    exportStudents() {
      this.$message.success('导出数据成功')
    }
  }
}
</script>

<style scoped>
.student-management {
  padding: 20px;
  height: 100%;
}

.action-buttons {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

/* 深度选择器修正表头对齐问题 */
:deep(.el-table th) {
  text-align: center;
}
:deep(.el-table .el-table__cell:nth-child(4)),
:deep(.el-table .el-table__cell:nth-child(5)) {
  text-align: left;
}
</style>