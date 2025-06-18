<template>
  <div class="class-management">
    <div class="header">
      <h2>班级管理</h2>
      <button class="create-btn" @click="createClass">创建新班级</button>
    </div>
    
    <div class="class-list">
      <div class="class-card" v-for="classItem in classes" :key="classItem.id">
        <h3>{{ classItem.name }}</h3>
        <p>学生人数: {{ classItem.studentCount }}</p>
        <p>创建时间: {{ classItem.createTime }}</p>
        <div class="actions">
          <button @click="manageClass(classItem.id)">管理</button>
          <button @click="viewStudents(classItem.id)">查看学生</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClassManagement',
  data() {
    return {
      classes: [
        {
          id: 1,
          name: '2023级计算机1班',
          studentCount: 45,
          createTime: '2023-09-01'
        },
        {
          id: 2,
          name: '2023级计算机2班',
          studentCount: 38,
          createTime: '2023-09-01'
        }
      ]
    }
  },
  methods: {
    createClass() {
      console.log('创建新班级')
    },
    manageClass(classId) {
      this.$router.push(`/teacher/classManagement/${classId}`)
    },
    viewStudents(classId) {
      this.$router.push(`/teacher/studentManagement?classId=${classId}`)
    }
  }
}
</script>

<style scoped>
.class-management {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.create-btn {
  background: #3a7bd5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #2c6bc7;
}

.class-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.class-card:hover {
  transform: translateY(-5px);
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.actions button {
  flex: 1;
  padding: 8px;
  background: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.actions button:hover {
  background: #e6f0ff;
  border-color: #3a7bd5;
  color: #3a7bd5;
}
</style>