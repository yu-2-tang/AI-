<template>
  <div class="resource-preview">
    <h2>资源预览</h2>

    <div v-if="loading">加载中...</div>

    <div v-else-if="errorMessage" class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ errorMessage }}</div>
      <button @click="retry" class="retry-btn">重试</button>
      

    </div>

    <div v-else>
      <div v-if="previewUrl" class="preview-container">        
        <!-- 如果是资源列表且有多个资源，显示提示 -->
        <div v-if="debugInfo?.isResourceList && debugInfo?.resourceCount > 1" class="multiple-resources-notice">
          <p>📋 检测到该课程下有 {{ debugInfo.resourceCount }} 个资源，当前预览: <strong>{{ debugInfo.processedResourceData?.name }}</strong></p>
          <details class="resource-list">
            <summary>查看所有资源 ({{ debugInfo.resourceCount }}个)</summary>
            <ul>
              <li v-for="(resource, index) in debugInfo.processedData" :key="index">
                {{ resource.name }} ({{ formatResourceType(resource.type) }}) - {{ Math.round(resource.size / 1024) }}KB
              </li>
            </ul>
          </details>
        </div>
        
        <iframe
          :src="previewUrl"
          width="100%"
          height="800px"
          frameborder="0"
          allowfullscreen
          @load="onIframeLoad"
          @error="onIframeError"
        ></iframe>
      </div>
      <div v-else class="no-preview">
        <p>无法生成预览链接</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'ResourcePreview',
  props: ['resourceId'],
  data() {
    return {
      previewUrl: '',
      errorMessage: '',
      loading: true,
      debugInfo: null // 保留debugInfo用于多资源显示
    };
  },
  computed: {
    currentResourceId() {
      // 优先使用 props，如果没有则使用路由参数
      return this.resourceId || this.$route.params.resourceId;
    }
  },
  async mounted() {
    await this.loadPreview();
  },
  methods: {
    async loadPreview() {
      this.loading = true;
      this.errorMessage = '';
      this.debugInfo = null;

      // 根据路由决定 API 端点
      const isTeacherRoute = this.$route.name === 'TeacherResourcePreview' || this.$route.path.includes('/teacher/');
      let apiEndpoints = [];
      
      // 智能判断ID类型和构建端点
      const inputId = this.currentResourceId;
      
      if (isTeacherRoute) {
        apiEndpoints = [
          `/teacher/resources/${inputId}`,
          `/resources/${inputId}`,
          `/teacher/courses/${inputId}/resources`,
          `/preview/${inputId}`,
          `/teacher/courses/${inputId}/preview`
        ];
      } else {
        apiEndpoints = [
          `/resources/${inputId}`,
          `/teacher/resources/${inputId}`,
          `/courses/${inputId}/resources`,
          `/preview/${inputId}`
        ];
      }
      
      try {
        // 检查 resourceId 是否存在
        if (!this.currentResourceId) {
          throw new Error('资源ID不能为空');
        }

        // 尝试多个可能的 API 端点
        let response;
        let resourceData;
        let lastError;
        
        for (let i = 0; i < apiEndpoints.length; i++) {
          const endpoint = apiEndpoints[i];
          try {
            response = await api.get(endpoint);
            resourceData = response;
            break;
          } catch (error) {
            lastError = error;
            if (i === apiEndpoints.length - 1) {
              throw lastError;
            }
          }
        }
        
        if (!resourceData) {
          throw new Error('未找到资源数据');
        }

        // 处理不同的响应数据格式
        let fileUrl = '';
        let actualResourceData = resourceData;
        let isResourceList = false;
        let processedData = resourceData;
        
        // 检查是否是后端API的标准响应格式 {code, message, data}
        if (resourceData.code && resourceData.data) {
          processedData = resourceData.data;
          
          // 如果data包含content字段（分页数据），使用content
          if (processedData.content && Array.isArray(processedData.content)) {
            processedData = processedData.content;
          }
        }
        
        // 检查是否返回的是资源列表
        if (Array.isArray(processedData)) {
          isResourceList = true;
          if (processedData.length === 0) {
            throw new Error('该课程下没有找到任何资源');
          }
          
          actualResourceData = processedData[0]; // 使用第一个资源
        } else {
          actualResourceData = processedData;
        }
        
        // 从资源对象中提取文件路径
        if (actualResourceData.url) {
          fileUrl = actualResourceData.url;
        } else if (actualResourceData.fileUrl) {
          fileUrl = actualResourceData.fileUrl;
        } else if (actualResourceData.filePath) {
          fileUrl = actualResourceData.filePath;
        } else if (actualResourceData.path) {
          fileUrl = actualResourceData.path;
        } else if (typeof actualResourceData === 'string') {
          fileUrl = actualResourceData;
        } else {
          throw new Error('无法从响应中提取文件路径');
        }

        // 构建最终的预览URL
        const isAbsolute = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
        this.previewUrl = isAbsolute
          ? fileUrl
          : `http://localhost:8082/${fileUrl.replace(/^\/?/, '')}`;
        
        // 只在多资源时保存调试信息
        if (isResourceList && processedData.length > 1) {
          this.debugInfo = {
            isResourceList: true,
            resourceCount: processedData.length,
            processedData: processedData,
            processedResourceData: actualResourceData
          };
        }
      } catch (err) {
        console.error('资源预览加载失败:', err);
        
        // 错误处理
        if (err.response) {
          const status = err.response.status;
          const errorData = err.response.data;
          
          if (status === 400) {
            this.errorMessage = `请求参数错误: ${errorData?.message || '资源ID格式可能不正确'}`;
          } else if (status === 404) {
            this.errorMessage = '资源不存在或已被删除';
          } else if (status === 500) {
            this.errorMessage = `服务器内部错误: ${errorData?.message || '请联系管理员'}`;
          } else if (status === 403) {
            this.errorMessage = '没有权限访问此资源';
          } else {
            this.errorMessage = `请求失败 (${status}): ${errorData?.message || err.message}`;
          }
        } else if (err.request) {
          this.errorMessage = '网络连接失败，请检查网络连接';
        } else {
          this.errorMessage = err.message || '预览加载失败';
        }
      } finally {
        this.loading = false;
      }
    },
    
    retry() {
      this.loadPreview();
    },
    
    onIframeLoad() {
      console.log('iframe 加载完成');
    },
    
    onIframeError() {
      console.error('iframe 加载失败');
      this.errorMessage = '资源文件加载失败，可能文件不存在或格式不支持预览';
    },
    
    formatResourceType(type) {
      const typeMap = {
        'PDF': 'PDF文档',
        'PPT': 'PPT演示文稿',
        'VIDEO': '视频',
        'DOCUMENT': '文档',
        'IMAGE': '图片'
      };
      return typeMap[type] || type;
    }
  }

};
</script>

<style scoped>
.resource-preview {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  margin: 20px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #e53e3e;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
  line-height: 1.5;
}

.retry-btn {
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background-color: #2c5aa0;
}

.preview-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-info {
  background-color: #f7fafc;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 12px;
  color: #718096;
}

.preview-info span {
  margin-right: 16px;
  word-break: break-all;
}

.no-preview {
  text-align: center;
  padding: 40px;
  color: #718096;
}

iframe {
  display: block;
}

.multiple-resources-notice {
  background-color: #e6f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  padding: 12px;
  margin: 10px 0;
}

.multiple-resources-notice p {
  margin: 0 0 8px 0;
  color: #0066cc;
  font-size: 14px;
}

.resource-list {
  margin-top: 8px;
}

.resource-list summary {
  cursor: pointer;
  font-weight: bold;
  color: #0066cc;
  font-size: 13px;
}

.resource-list ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.resource-list li {
  font-size: 12px;
  margin: 4px 0;
  color: #333;
}
</style>
