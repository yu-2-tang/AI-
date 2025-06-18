<template>
  <div class="student-import-export">
    <h2>学生数据导入/导出</h2>
    
    <div class="import-section">
      <h3>导入学生数据</h3>
      <el-upload
        action="#"
        accept=".xlsx,.xls,.csv"
        :show-file-list="false"
        :before-upload="beforeUpload"
      >
        <el-button type="primary">选择Excel文件</el-button>
      </el-upload>
      <p class="tip">支持Excel或CSV格式，请确保包含学号、姓名等必要字段</p>
    </div>
    
    <div class="export-section">
      <h3>导出学生数据</h3>
      <el-button 
        type="success" 
        @click="exportData"
      >
        导出为Excel
      </el-button>
      <p class="tip">导出当前所有学生数据</p>
    </div>
    
    <div class="template-section">
      <h3>下载模板</h3>
      <el-button 
        type="info" 
        @click="downloadTemplate"
      >
        下载导入模板
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentImportExport',
  methods: {
    beforeUpload(file) {
      console.log('准备导入文件:', file.name)
      // 这里实际应该处理文件上传逻辑
      this.$message.success('文件上传成功，开始处理数据...')
      return false
    },
    exportData() {
      this.$message.success('导出数据成功')
    },
    downloadTemplate() {
      this.$message.info('模板下载开始')
    }
  }
}
</script>

<style scoped>
.student-import-export {
  padding: 20px;
}

.import-section,
.export-section,
.template-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}
</style>