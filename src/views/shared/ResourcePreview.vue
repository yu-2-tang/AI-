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
        <iframe
          :src="previewUrl"
          width="100%"
          height="800px"
          style="min-height:600px;min-width:100%;"
          @load="onIframeLoad"
          @error="onIframeError"
        ></iframe>
        <div style="margin-top:10px;">
          <a :href="previewUrl" target="_blank" rel="noopener" style="color:#3182ce;">无法预览？点击新窗口打开</a>
        </div>
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
          `/teacher/resources/${inputId}`,  // 修复：优先使用teacher路径
          `/resources/${inputId}`,
          `/teacher/courses/${inputId}/resources`,  // 添加teacher课程资源路径
          `/courses/${inputId}/resources`,
          `/preview/${inputId}`
        ];
      }
      
      try {
        // 检查 resourceId 是否存在
        if (!this.currentResourceId) {
          throw new Error('资源ID不能为空');
        }

        console.group('🚀 开始加载资源预览');
        console.log('🆔 资源ID:', this.currentResourceId);
        console.log('🛤️ 当前路由:', this.$route.path);
        console.log('👨‍🏫 是否为教师路由:', isTeacherRoute);
        console.log('🔗 尝试的API端点列表:', apiEndpoints);

        // 尝试多个可能的 API 端点
        let response;
        let resourceData;
        let lastError;
        let successEndpoint = '';
        
        for (let i = 0; i < apiEndpoints.length; i++) {
          const endpoint = apiEndpoints[i];
          console.log(`📡 尝试API端点 ${i + 1}/${apiEndpoints.length}:`, endpoint);
          
          try {
            response = await api.get(endpoint);
            resourceData = response;
            successEndpoint = endpoint;
            console.log('✅ API调用成功:', endpoint);
            break;
          } catch (error) {
            console.log(`❌ API端点失败:`, endpoint, error.response?.status, error.message);
            lastError = error;
            if (i === apiEndpoints.length - 1) {
              throw lastError;
            }
          }
        }
        
        if (!resourceData) {
          throw new Error('未找到资源数据');
        }

        console.log('📥 原始响应数据:', resourceData);

        // 处理不同的响应数据格式
        let fileUrl = '';
        let actualResourceData = resourceData;
        let isResourceList = false;
        let processedData = resourceData;
        
        // 检查是否是后端API的标准响应格式 {code, message, data}
        if (resourceData.code && resourceData.data) {
          processedData = resourceData.data;
          console.log('🔄 检测到标准API响应格式，提取data字段:', processedData);
          
          // 如果data包含content字段（分页数据），使用content
          if (processedData.content && Array.isArray(processedData.content)) {
            processedData = processedData.content;
            console.log('📄 检测到分页数据，提取content字段:', processedData);
          }
        }
        
        // 检查是否返回的是资源列表
        if (Array.isArray(processedData)) {
          isResourceList = true;
          console.log('📋 检测到资源列表，资源数量:', processedData.length);
          
          if (processedData.length === 0) {
            throw new Error('该课程下没有找到任何资源');
          }
          
          actualResourceData = processedData[0]; // 使用第一个资源
          console.log('🎯 使用第一个资源进行预览:', actualResourceData);
        } else {
          console.log('📄 单个资源数据:', processedData);
          actualResourceData = processedData;
        }
        
        // 从资源对象中提取文件路径
        console.log('🔍 开始提取文件URL，资源数据结构:', Object.keys(actualResourceData));
        
        if (actualResourceData.url) {
          fileUrl = actualResourceData.url;
          console.log('✅ 从url字段提取:', fileUrl);
        } else if (actualResourceData.fileUrl) {
          fileUrl = actualResourceData.fileUrl;
          console.log('✅ 从fileUrl字段提取:', fileUrl);
        } else if (actualResourceData.filePath) {
          fileUrl = actualResourceData.filePath;
          console.log('✅ 从filePath字段提取:', fileUrl);
        } else if (actualResourceData.path) {
          fileUrl = actualResourceData.path;
          console.log('✅ 从path字段提取:', fileUrl);
        } else if (typeof actualResourceData === 'string') {
          fileUrl = actualResourceData;
          console.log('✅ 资源数据本身就是字符串URL:', fileUrl);
        } else {
          console.error('❌ 无法提取文件路径，资源数据:', actualResourceData);
          throw new Error('无法从响应中提取文件路径');
        }

        // 构建最终的预览URL - 根据文件类型选择合适的预览方式
        const fileName = this.extractFileName(fileUrl);
        const fileExtension = this.getFileExtension(fileName);
        const fileType = this.detectFileType(fileName, actualResourceData);
        
        // 需要通过预览API处理的文件类型
        const needsPreviewAPI = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(fileExtension.toLowerCase()) ||
                                ['DOCUMENT', 'PPT'].includes(fileType);
        
        if (needsPreviewAPI) {
          // 先请求预览API，拿到真正的 PDF 路径
          try {
            const previewRes = await api.get(`/preview/${this.currentResourceId}`);
            // 兼容后端返回 { previewUrl: ... } 或直接返回字符串
            let previewUrl = previewRes.previewUrl || previewRes;
            if (previewUrl) {
              this.previewUrl = previewUrl.startsWith('http')
                ? previewUrl
                : `http://localhost:8082${previewUrl}`;
              console.log('🔄 使用后端返回的 previewUrl:', this.previewUrl);
            } else {
              this.previewUrl = '';
              this.errorMessage = '后端未返回可用的预览链接';
            }
          } catch (e) {
            this.errorMessage = '获取预览链接失败';
            console.error('获取预览链接失败', e);
            return;
          }
        } else {
          // 直接访问文件（适用于PDF、图片等）
          const isAbsolute = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
          this.previewUrl = isAbsolute
            ? fileUrl
            : `http://localhost:8082/${fileUrl.replace(/^\/?/, '')}`;
          console.log('🔗 直接访问文件，URL类型:', isAbsolute ? '绝对路径' : '相对路径');
        }
        
        console.log('👁️ 最终预览URL:', this.previewUrl);
        console.log('当前预览URL:', this.previewUrl);
        
        // 提取文件信息用于调试（变量已在上面定义）
        const mimeType = this.getMimeType(fileExtension);
        const fileSize = actualResourceData.size || actualResourceData.fileSize || 0;
        
        // 在控制台输出详细调试信息
        console.group('🔍 资源预览调试信息');
        console.log('📁 文件名:', fileName);
        console.log('🏷️ 文件类型:', fileType, `(${this.formatFileType(fileType)})`);
        console.log('📎 文件扩展名:', fileExtension);
        console.log('🔧 MIME类型:', mimeType);
        console.log('📊 文件大小:', this.formatFileSize(fileSize), `(${fileSize} bytes)`);
        console.log('🌍 原始URL:', fileUrl);
        console.log('👁️ 预览URL:', this.previewUrl);
        console.log('🆔 资源ID:', this.currentResourceId);
        console.log('🔗 成功的API端点:', successEndpoint);
        console.log('📋 是否为资源列表:', isResourceList);
        console.log('🔢 资源数量:', isResourceList ? processedData.length : 1);
        console.log('📄 原始响应数据:', resourceData);
        console.log('⚙️ 处理后的数据:', processedData);
        console.log('🎯 实际资源数据:', actualResourceData);
        console.groupEnd();
        
        // 保存调试信息（简化版，主要用于多资源显示）
        this.debugInfo = isResourceList && processedData.length > 1 ? {
          isResourceList: true,
          resourceCount: processedData.length,
          processedData: processedData,
          processedResourceData: actualResourceData
        } : null;
        
        console.groupEnd(); // 关闭 "开始加载资源预览" 组
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
      console.error('iframe 加载失败', event);
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
    },
    
    // 新增的调试信息处理方法
    extractFileName(url) {
      if (!url) return '未知';
      const parts = url.split('/');
      return parts[parts.length - 1] || '未知';
    },
    
    getFileExtension(fileName) {
      if (!fileName) return '';
      const lastDot = fileName.lastIndexOf('.');
      return lastDot !== -1 ? fileName.slice(lastDot + 1).toLowerCase() : '';
    },
    
    detectFileType(fileName, resourceData) {
      // 首先检查资源数据中的类型信息
      if (resourceData.type) {
        return resourceData.type;
      }
      
      // 根据文件扩展名判断类型
      const extension = this.getFileExtension(fileName);
      const typeMap = {
        'pdf': 'PDF',
        'doc': 'DOCUMENT',
        'docx': 'DOCUMENT',
        'ppt': 'PPT',
        'pptx': 'PPT',
        'xls': 'DOCUMENT',
        'xlsx': 'DOCUMENT',
        'txt': 'DOCUMENT',
        'mp4': 'VIDEO',
        'avi': 'VIDEO',
        'mov': 'VIDEO',
        'wmv': 'VIDEO',
        'flv': 'VIDEO',
        'webm': 'VIDEO',
        'jpg': 'IMAGE',
        'jpeg': 'IMAGE',
        'png': 'IMAGE',
        'gif': 'IMAGE',
        'bmp': 'IMAGE',
        'svg': 'IMAGE',
        'html': 'WEB',
        'htm': 'WEB',
        'zip': 'ARCHIVE',
        'rar': 'ARCHIVE',
        '7z': 'ARCHIVE'
      };
      
      return typeMap[extension] || 'UNKNOWN';
    },
    
    getMimeType(extension) {
      const mimeMap = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
        'mp4': 'video/mp4',
        'avi': 'video/avi',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'html': 'text/html',
        'htm': 'text/html',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed'
      };
      
      return mimeMap[extension] || 'application/octet-stream';
    },
    
    formatFileType(type) {
      const typeMap = {
        'PDF': '📄 PDF文档',
        'PPT': '📊 PowerPoint演示文稿',
        'VIDEO': '🎥 视频文件',
        'DOCUMENT': '📝 文档',
        'IMAGE': '🖼️ 图片',
        'WEB': '🌐 网页文件',
        'ARCHIVE': '📦 压缩文件',
        'UNKNOWN': '❓ 未知类型'
      };
      return typeMap[type] || `📄 ${type}`;
    },
    
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '未知大小';
      
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(2)} ${units[unitIndex]}`;
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

embed {
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
