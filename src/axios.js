import axios from 'axios';

// 根据环境变量设置基础 URL
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com/api' // 生产环境
  : 'http://localhost:8082/api';         // 开发环境

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000
});


// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {  // 401 Unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
