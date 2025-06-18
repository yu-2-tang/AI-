<template>
  <div class="student-homework">
    <h2>我的作业</h2>
    <div class="homework-list">
      <div class="homework-item" v-for="(item, index) in homeworkList" :key="index">
        <h3>{{ item.title }}</h3>
        <p>截止时间: {{ item.deadline }}</p>
        <p>状态: <span :class="item.status">{{ item.statusText }}</span></p>
        <button @click="viewDetail(item.id)">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentHomework',
  data() {
    return {
      homeworkList: [
        {
          id: 1,
          title: '数学作业 - 第三章练习题',
          deadline: '2023-12-15',
          status: 'pending',
          statusText: '待提交'
        },
        {
          id: 2,
          title: '英语作文 - 我的假期',
          deadline: '2023-12-20',
          status: 'submitted',
          statusText: '已提交'
        }
      ]
    }
  },
  methods: {
    viewDetail(id) {
      this.$router.push(`/student/homework/${id}`)
    }
  }
}
</script>

<style scoped>
.student-homework {
  padding: 20px;
}

.homework-list {
  margin-top: 20px;
}

.homework-item {
  background: #fff;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.homework-item h3 {
  color: #3a7bd5;
  margin-bottom: 10px;
}

.homework-item p {
  color: #666;
  margin: 5px 0;
}

.pending {
  color: #f56c6c;
}

.submitted {
  color: #67c23a;
}

button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}
</style>