<template>
  <div class="task-submission">
    <h2>提交作业: {{ task.title }}</h2>
    
    <el-form :model="form" label-width="80px">
      <el-form-item label="作业内容">
        <el-input 
          v-model="form.content" 
          type="textarea" 
          :rows="6"
          placeholder="请输入作业内容"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="附件">
        <el-upload
          action="#"
          :limit="3"
          :file-list="fileList"
        >
          <el-button type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submit">提交作业</el-button>
        <el-button @click="$router.go(-1)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'TaskSubmission',
  data() {
    return {
      task: {
        id: this.$route.params.id,
        title: '第一章作业'
      },
      form: {
        content: ''
      },
      fileList: []
    }
  },
  methods: {
    submit() {
      this.$message.success('作业提交成功')
      this.$router.push(`/student/homework/${this.task.id}`)
    }
  }
}
</script>

<style scoped>
.task-submission {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>