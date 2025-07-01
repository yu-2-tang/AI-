<template>
  <div class="resource-preview">
    <h2>资源预览</h2>

    <div v-if="loading">加载中...</div>

    <div v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <div v-else>
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        width="100%"
        height="800px"
        frameborder="0"
        allowfullscreen
      ></iframe>
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
      loading: true
    };
  },
  async mounted() {
  try {
    const res = await api.get(`/preview/${this.resourceId}`);
    const rawUrl = res;

    console.log('预览原始 URL:', rawUrl);

    const isAbsolute = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
    this.previewUrl = isAbsolute
      ? rawUrl
      : `http://localhost:8082/${rawUrl.replace(/^\/?/, '')}`; // 确保前缀拼上
  } catch (err) {
    this.errorMessage = '预览加载失败：' + (err.response?.data || err.message);
  } finally {
    this.loading = false;
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

.error {
  color: red;
  font-weight: bold;
}
</style>
