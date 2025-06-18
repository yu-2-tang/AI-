import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  // 教师端路由
  {
    path: '/teacher',
    component: () => import('../views/teacher/TeacherDashboard.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    redirect: '/teacher/students', // 添加默认重定向
    children: [
      // 学生管理
      {
        path: 'students',
        name: 'StudentManagement',
        component: () => import('../views/teacher/StudentManagement.vue') // 使用合并后的组件
      },
      {
        path: 'students/import-export',
        name: 'StudentImportExport',
        component: () => import('../views/teacher/StudentImportExport.vue')
      },
      
      // 课程管理
      {
        path: 'courses',
        name: 'CourseManagement',
        component: () => import('../views/teacher/CourseManagement.vue') // 修正路径
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('../views/shared/CourseDetail.vue'),
        props: true // 添加props传参
      },
      
      // 任务管理
      {
        path: 'tasks',
        name: 'TaskManagement',
        component: () => import('../views/teacher/TaskManagement.vue')
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('../views/shared/TaskDetail.vue'),
        props: true
      },
      
      // 学习分析
      {
        path: 'analytics',
        name: 'LearningAnalytics',
        component: () => import('../views/teacher/LearningAnalytics.vue')
      }
    ]
  },
  // 学生端路由
  {
    path: '/student',
    component: () => import('../views/student/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' },
    redirect: '/student/courses', // 添加默认重定向
    children: [
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('../views/student/Courses.vue')
      },
      {
        path: 'courses/:id',
        name: 'StudentCourseDetail',
        component: () => import('../views/shared/CourseDetail.vue'),
        props: true
      },
      {
        path: 'homework',
        name: 'StudentHomework',
        component: () => import('../views/student/Homework.vue')
      },
      {
        path: 'homework/:id',
        name: 'StudentTaskDetail',
        component: () => import('../views/shared/TaskDetail.vue'),
        props: true
      },
      {
        path: 'homework/:id/submit',
        name: 'TaskSubmission',
        component: () => import('../views/student/TaskSubmission.vue'),
        props: true
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('../views/student/Grades.vue')
      },
      {
        path: 'performance',
        name: 'PerformanceDashboard',
        component: () => import('../views/student/PerformanceDashboard.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router // 修正导出语句