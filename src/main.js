import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 确保router/index.js已配置

const app = createApp(App)
app.use(router)
app.mount('#app')