<template>
  <div class="management-container">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <h2 class="title">课程管理</h2>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          icon="el-icon-plus"
          @click="showAddDialog"
          class="action-btn">
          新增课程
        </el-button>
      </div>
    </div>

    <!-- 课程表格 -->
    <el-table 
      :data="courseList" 
      border 
      stripe
      style="width: 100%"
      class="data-table">
      <el-table-column 
        prop="courseCode" 
        label="课程编号" 
        width="120"
        align="center">
      </el-table-column>
      <el-table-column 
        prop="courseName" 
        label="课程名称">
      </el-table-column>
      <el-table-column 
        prop="teacher" 
        label="授课教师" 
        width="120"
        align="center">
      </el-table-column>
      <el-table-column 
        prop="credit" 
        label="学分" 
        width="80"
        align="center">
      </el-table-column>
      <el-table-column 
        prop="hours" 
        label="学时" 
        width="80"
        align="center">
      </el-table-column>
      <el-table-column 
        label="操作" 
        width="180"
        align="center">
        <template #default="scope">
          <el-button 
            size="mini" 
            type="primary" 
            icon="el-icon-edit"
            @click="editCourse(scope.row)"
            class="table-btn">
            编辑
          </el-button>
          <el-button 
            size="mini" 
            type="danger" 
            icon="el-icon-delete"
            @click="deleteCourse(scope.row.courseCode)"
            class="table-btn">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCourses"
        :page-size="pageSize"
        @current-change="handlePageChange">
      </el-pagination>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible"
      width="50%">
      <el-form :model="courseForm" label-width="100px">
        <el-form-item label="课程编号" required>
          <el-input v-model="courseForm.courseCode"></el-input>
        </el-form-item>
        <el-form-item label="课程名称" required>
          <el-input v-model="courseForm.courseName"></el-input>
        </el-form-item>
        <el-form-item label="授课教师" required>
          <el-input v-model="courseForm.teacher"></el-input>
        </el-form-item>
        <el-form-item label="学分" required>
          <el-input-number 
            v-model="courseForm.credit" 
            :min="1" 
            :max="10">
          </el-input-number>
        </el-form-item>
        <el-form-item label="学时" required>
          <el-input-number 
            v-model="courseForm.hours" 
            :min="16" 
            :max="128">
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitForm"
          class="dialog-btn">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CourseManagement',
  data() {
    return {
      courseList: [
        {
          courseCode: 'CS101',
          courseName: '计算机科学导论',
          teacher: '张教授',
          credit: 3,
          hours: 48
        },
        {
          courseCode: 'CS201',
          courseName: '数据结构与算法',
          teacher: '李教授',
          credit: 4,
          hours: 64
        }
      ],
      totalCourses: 2,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增课程',
      courseForm: {
        courseCode: '',
        courseName: '',
        teacher: '',
        credit: 3,
        hours: 32
      },
      currentCourseCode: null
    }
  },
  methods: {
    showAddDialog() {
      this.dialogTitle = '新增课程'
      this.courseForm = {
        courseCode: '',
        courseName: '',
        teacher: '',
        credit: 3,
        hours: 32
      }
      this.dialogVisible = true
    },
    editCourse(course) {
      this.dialogTitle = '编辑课程'
      this.courseForm = { ...course }
      this.currentCourseCode = course.courseCode
      this.dialogVisible = true
    },
    deleteCourse(courseCode) {
      this.$confirm('确认删除该课程吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.courseList = this.courseList.filter(c => c.courseCode !== courseCode)
        this.$message.success('删除成功!')
      })
    },
    submitForm() {
      if (this.dialogTitle === '新增课程') {
        this.courseList.push({ ...this.courseForm })
        this.$message.success('添加成功!')
      } else {
        const index = this.courseList.findIndex(c => c.courseCode === this.currentCourseCode)
        this.courseList.splice(index, 1, { ...this.courseForm })
        this.$message.success('更新成功!')
      }
      this.dialogVisible = false
    },
    handlePageChange(page) {
      console.log('切换页码:', page)
      // 实际项目中这里调用API获取分页数据
    }
  }
}
</script>

<style scoped>
/* 复用学生管理组件的样式 */
.management-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 20px;
}

.data-table {
  margin-bottom: 20px;
}

.table-btn {
  padding: 7px 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 10px 20px;
}
</style>