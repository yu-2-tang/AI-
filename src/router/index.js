// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  /* ---------- 公共页面 ---------- */
  {
    path: '/',
    name: 'home',
    component: HomeView
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

  /* ---------- 教师端 ---------- */
  {
    path: '/teacher',
    component: () => import('../views/teacher/TeacherDashboard.vue'),
    redirect: '/teacher/students',
    children: [
      {
        path: 'students',
        name: 'StudentManagement',
        component: () => import('../views/teacher/StudentManagement.vue')
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: () => import('../views/teacher/CourseManagement.vue')
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('../views/shared/CourseDetail.vue'),
        props: true
      },
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
      {
        path: 'grades',
        name: 'GradeManagement',
        component: () => import('../views/teacher/GradeManagement.vue')
      }
    ]
  },

  /* ---------- 学生端 ---------- */
  {
    path: '/student',
    component: () => import('../views/student/StudentDashboard.vue'),
    redirect: '/student/courses',
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
  },

  /* ---------- 404 ---------- */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
