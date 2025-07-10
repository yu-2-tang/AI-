import axios from 'axios';

// 根据环境变量设置基础 URL
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com/api' // 生产环境
  : 'http://localhost:8082/api';         // 开发环境

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000 // 增加到30秒，因为AI推荐可能需要更长时间
});


// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data || config.params || '');
  return config;
}, error => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.status);
    console.log('Response Data:', response.data);
    
    // 检查响应数据结构
    if (response.data && typeof response.data === 'object') {
      console.log('Response Data Type:', typeof response.data);
      console.log('Response Data Keys:', Object.keys(response.data));
    }
    
    return response.data;
  },
  error => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {  // 401 Unauthorized
      console.warn('用户未认证，跳转到登录页面');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // 为错误对象添加更友好的错误信息
    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    error.friendlyMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export default api;
