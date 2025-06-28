<template>
  <div class="knowledge-point-mgmt">
    <h2>知识点管理 - {{ courseName }}</h2>

    <!-- 添加知识点区域 -->
    <div class="add-knowledge-point-section">
      <div class="form-group">
        <label>知识点名称</label>
        <input v-model="newKnowledgePoint.name" placeholder="输入知识点名称" />
      </div>
      <div class="form-group">
        <label>知识点描述</label>
        <textarea v-model="newKnowledgePoint.description" placeholder="输入知识点描述"></textarea>
      </div>
      <button class="btn primary-btn" @click="addKnowledgePoint">添加知识点</button>
    </div>

    <!-- 知识点列表 -->
    <div class="knowledge-point-list">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in knowledgePoints" :key="point.pointId">
            <td>{{ point.name }}</td>
            <td>{{ point.description }}</td>
            <td>
              <button class="btn outline-btn" @click="viewKnowledgePoint(point)">查看</button>
              <button class="btn warning-btn" @click="editKnowledgePoint(point)">编辑</button>
              <button class="btn danger-btn" @click="deleteKnowledgePoint(point)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑知识点弹窗 -->
    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal">
        <h3>编辑知识点</h3>
        <label>知识点名称</label>
        <input v-model="editKnowledgePointData.name" required />
        <label>知识点描述</label>
        <textarea v-model="editKnowledgePointData.description" required></textarea>
        <div class="modal-actions">
          <button @click="updateKnowledgePoint">保存</button>
          <button class="danger-btn" @click="showEditForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "KnowledgePointManagement",
  data() {
    return {
      courseId: this.$route.params.courseId,
      courseName: "",
      knowledgePoints: [],
      newKnowledgePoint: {
        name: "",
        description: ""
      },
      showEditForm: false,
      editKnowledgePointData: {
        pointId: null,
        name: "",
        description: ""
      }
    };
  },
  methods: {
    async fetchCourseInfo() {
      try {
        const res = await axios.get(`/teacher/courses/${this.courseId}`);
        this.courseName = res.data.name || res.data.data?.name || "";
      } catch (err) {
        console.error("获取课程信息失败", err);
      }
    },
    async fetchKnowledgePoints() {
      try {
        const res = await axios.get(`/teacher/courses/${this.courseId}/knowledge-points`);
        this.knowledgePoints = res.data || [];
      } catch (err) {
        console.error("获取知识点失败", err);
      }
    },
    async addKnowledgePoint() {
      if (!this.newKnowledgePoint.name || !this.newKnowledgePoint.description) {
        alert("请填写知识点名称和描述！");
        return;
      }
      try {
        await axios.post(`/teacher/courses/${this.courseId}/knowledge-points`, this.newKnowledgePoint);
        alert("添加成功");
        this.fetchKnowledgePoints();
        this.newKnowledgePoint = { name: "", description: "" };
      } catch (err) {
        console.error("添加失败", err);
        alert("添加失败");
      }
    },
    viewKnowledgePoint(point) {
      alert(`查看知识点 ID: ${point.pointId}`);
    },
    editKnowledgePoint(point) {
      this.editKnowledgePointData = { ...point };
      this.showEditForm = true;
    },
    async updateKnowledgePoint() {
      try {
        await axios.put(
          `/teacher/courses/${this.courseId}/knowledge-points/${this.editKnowledgePointData.pointId}`,
          this.editKnowledgePointData
        );
        alert("更新成功");
        this.showEditForm = false;
        this.fetchKnowledgePoints();
      } catch (err) {
        console.error("更新失败", err);
        alert("更新失败");
      }
    },
    async deleteKnowledgePoint(point) {
      if (!confirm(`确认删除知识点 "${point.name}" 吗？`)) return;
      try {
        await axios.delete(`/teacher/knowledge-points/${point.pointId}`);
        alert("删除成功");
        this.fetchKnowledgePoints();
      } catch (err) {
        console.error("删除失败", err);
        alert("删除失败");
      }
    }
  },
  mounted() {
    this.fetchCourseInfo();
    this.fetchKnowledgePoints();
  }
};
</script>

<style scoped>
.knowledge-point-mgmt {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.add-knowledge-point-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.primary-btn {
  background: #4a90e2;
  color: white;
}

.outline-btn {
  background: transparent;
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.danger-btn {
  background: #e74c3c;
  color: white;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.knowledge-point-list {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

thead tr {
  background-color: #f8f9fa;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

/* modal 样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal input,
.modal textarea {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
}

.modal label {
  font-weight: bold;
  margin-top: 8px;
  display: block;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

</style>
