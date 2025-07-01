<template>
  <div class="resource-mgmt">
    <h2>资源管理 - {{ courseName }}</h2>

    <!-- 上传资源区域 -->
    <div class="upload-section">
      <div class="form-group">
        <label>资源名称</label>
        <input v-model="uploadData.name" placeholder="输入资源名称" />
      </div>
      <div class="form-group">
        <label>资源类型</label>
        <select v-model="uploadData.type">
          <option value="PDF">PDF</option>
          <option value="PPT">PPT</option>
          <option value="VIDEO">视频</option>
          <option value="DOCUMENT">文档</option>
        </select>
      </div>
      <div class="form-group">
        <label>关联知识点</label>
        <select v-model="uploadData.knowledgePointId">
          <option disabled value="">请选择知识点</option>
          <option v-for="point in knowledgePoints" :key="point.pointId" :value="point.pointId">
            {{ point.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>资源描述</label>
        <textarea v-model="uploadData.description" placeholder="输入资源描述"></textarea>
      </div>
      <div class="form-group">
        <label>选择文件</label>
        <input type="file" ref="fileInput" @change="handleFileChange" />
      </div>
      <button class="btn primary-btn" @click="uploadResource">上传资源</button>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>大小</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in resources" :key="res.resourceId">
            <td>{{ res.name }}</td>
            <td>{{ res.type }}</td>
            <td>{{ formatSize(res.size) }}</td>
            <td>{{ formatDate(res.uploadTime) }}</td>
            <td>
              <button @click="downloadResource(res)" class="btn outline-btn">下载</button>
              <button @click="updateResource(res)" class="btn outline-btn">编辑</button>
              <button @click="viewResource(res)" class="btn primary-btn">查看</button>
              <button @click="deleteResource(res)" class="btn danger-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="changePage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import axios from 'axios'

export default {
  name: 'ResourceManagement',
  data() {
    return {
      courseId: this.$route.params.courseId,
      courseName: '',
      resources: [],
      knowledgePoints: [],
      uploadData: {
        name: '',
        type: 'PDF',
        description: '',
        knowledgePointId: '',
        file: null
      },
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0
    };
  },
  methods: {
    async fetchCourseInfo() {
      try {
        const res = await api.get(`/teacher/courses/${this.courseId}`);
        this.courseName = res.data.name;
      } catch (err) {
        console.error('获取课程信息失败', err);
      }
    },
    async fetchResources() {
      try {
        const res = await api.get(`/teacher/courses/${this.courseId}/resources`, {
          params: { page: this.currentPage, size: this.pageSize }
        });
        this.resources = res.data.content || [];
        this.totalElements = res.data.totalElements || 0;
        this.totalPages = res.data.totalPages || 0;
      } catch (err) {
        console.error('获取资源失败', err);
      }
    },
    async fetchKnowledgePoints() {
      try {
        const res = await api.get(`/teacher/courses/${this.courseId}/knowledge-points`);
        this.knowledgePoints = res.data || [];
      } catch (err) {
        console.error('获取知识点失败', err);
      }
    },
    handleFileChange(e) {
      this.uploadData.file = e.target.files[0];
    },
    async uploadResource() {
      if (!this.uploadData.file) {
        alert('请选择文件');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.uploadData.file);
      formData.append('name', this.uploadData.name);
      formData.append('type', this.uploadData.type);
      formData.append('description', this.uploadData.description);
      formData.append('knowledgePointId', this.uploadData.knowledgePointId);

      try {
        await api.post(
          `/teacher/courses/${this.courseId}/resources`, 
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        alert('上传成功');
        this.resetUploadForm();
        this.fetchResources();
      } catch (err) {
        console.error('上传失败', err);
        alert(`上传失败: ${err.response?.data?.message || err.message}`);
      }
    },
    resetUploadForm() {
      this.uploadData = {
        name: '',
        type: 'PDF',
        description: '',
        knowledgePointId: '',
        file: null
      };
      this.$refs.fileInput.value = '';
    },
    async downloadResource(resource) {
      try {
        // 使用原生axios避免响应拦截器影响
        const token = localStorage.getItem('token')
        const fullUrl = `http://localhost:8082/api/teacher/resources/${resource.resourceId}/download`
        
        const response = await axios.get(fullUrl, { 
          responseType: 'blob',
          timeout: 30000,
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        })

        // 检查响应是否成功
        if (!response || !response.data) {
          throw new Error('服务器响应异常，未获取到文件数据')
        }
        
        if (response.status && response.status !== 200) {
          throw new Error(`下载失败，状态码: ${response.status}`)
        }

        // 检查响应数据是否为有效的blob
        if (response.data.size === 0) {
          throw new Error('下载的文件大小为0，可能文件不存在或已损坏')
        }

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        
        // 处理文件名 - 优先使用响应头中的文件名
        let fileName = `resource_${resource.resourceId}`
        
        // 首先尝试从响应头获取文件名
        const contentDisposition = response.headers && response.headers['content-disposition']
        if (contentDisposition) {
          // 处理 UTF-8 编码的文件名
          const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
          if (utf8Match) {
            fileName = decodeURIComponent(utf8Match[1])
          } else {
            // 处理普通文件名
            const normalMatch = contentDisposition.match(/filename="?([^";\n]+)"?/)
            if (normalMatch) {
              fileName = normalMatch[1]
            }
          }
        }
        
        // 如果响应头没有文件名，使用资源名称
        if (!fileName || fileName === `resource_${resource.resourceId}`) {
          fileName = resource.name || `resource_${resource.resourceId}`
          
          // 根据资源类型添加合适的扩展名
          if (!fileName.includes('.')) {
            let extension = 'pdf' // 默认扩展名
            
            switch (resource.type?.toUpperCase()) {
              case 'VIDEO':
                extension = 'mp4'
                break
              case 'DOCUMENT':
                extension = 'doc'
                break
              case 'PDF':
                extension = 'pdf'
                break
              case 'PPT':
                extension = 'ppt'
                break
              case 'IMAGE':
                extension = 'jpg'
                break
              default:
                // 尝试从原始URL或其他字段获取扩展名
                if (resource.url) {
                  const urlExt = resource.url.split('.').pop()
                  if (urlExt && urlExt.length <= 4) {
                    extension = urlExt
                  }
                }
            }
            fileName = `${fileName}.${extension}`
          }
        }
        
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 释放内存
        window.URL.revokeObjectURL(url)
        
      } catch (err) {
        console.error('下载失败:', err)
        
        // 提供错误信息
        let errorMessage = '下载失败'
        
        if (err.response) {
          const status = err.response.status
          
          switch (status) {
            case 404:
              errorMessage = '资源文件不存在'
              break
            case 410:
              errorMessage = '资源文件已被删除'
              break
            case 403:
              errorMessage = '没有权限下载此资源'
              break
            case 401:
              errorMessage = '登录已过期，请重新登录'
              break
            case 500:
              errorMessage = '服务器内部错误'
              break
            default:
              errorMessage = `下载失败 (错误码: ${status})`
          }
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = '下载超时，请重试'
        } else if (err.message) {
          errorMessage = `下载失败: ${err.message}`
        }
        
        alert(errorMessage)
        
        // 如果是权限问题，跳转到登录页
        if (err.response && err.response.status === 401) {
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      }
    },

    async deleteResource(resource) {
      if (!confirm(`确定删除资源 "${resource.name}" 吗？`)) return;
      try {
        await api.delete(`/teacher/resources/${resource.resourceId}`);
        alert('删除成功');
        this.fetchResources();
      } catch (err) {
        console.error('删除失败', err);
        alert('删除失败');
      }
    },
    async updateResource(resource) {
      const newName = prompt('请输入新的资源名称', resource.name);
      if (!newName) return;
      try {
        await api.put(`/teacher/resources/${resource.resourceId}`, { name: newName });
        alert('更新成功');
        this.fetchResources();
      } catch (err) {
        console.error('更新失败', err);
        alert('更新失败');
      }
    },
    viewResource(resource) {
  if (resource.type === 'VIDEO') {
    // 跳转到视频播放页
    this.$router.push({ name: 'VideoPlayer', params: { resourceId: resource.resourceId } });
  } else {
    // 非视频资源，保留默认行为或扩展 PDF/PPT 阅读逻辑
    alert(`暂不支持预览该资源类型: ${resource.type}`);
  }
},

    changePage(page) {
      this.currentPage = page;
      this.fetchResources();
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    },
    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  },
  mounted() {
    this.fetchCourseInfo();
    this.fetchResources();
    this.fetchKnowledgePoints();
  }
};
</script>

<style scoped>
.resource-mgmt {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.form-group textarea {
  height: 80px;
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

.resource-list {
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
</style>
