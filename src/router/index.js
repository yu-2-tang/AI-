import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  /* ---------- 公共页面 ---------- */
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },

  /* ---------- 管理员端 ---------- */
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    redirect: '/admin/students',
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'students',
        name: 'AdminStudentManagement',
        component: () => import('@/views/admin/AdminStudentManagement.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'teachers',
        name: 'AdminTeacherManagement',
        component: () => import('@/views/admin/AdminTeacherManagement.vue'),
        meta: { title: '教师管理' }
      }
    ]
  },

  /* ---------- 教师端 ---------- */
  {
    path: '/teacher',
    component: () => import('@/views/teacher/TeacherDashboard.vue'),
    redirect: '/teacher/students',
    meta: { requiresAuth: true, roles: ['TEACHER'] }, // ✅ 添加权限控制
    children: [
      {
        path: 'students',
        name: 'StudentManagement',
        component: () => import('@/views/teacher/StudentManagement.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: () => import('@/views/teacher/CourseManagement.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'courses/:courseId/students',
        name: 'CourseStudents',
        component: () => import('@/views/teacher/CourseStudents.vue'),
        meta: { title: '课程学生列表' }
      },
      {
        path: 'tasks',
        name: 'TaskManagement',
        component: () => import('@/views/teacher/TaskManagement.vue')
      },
      {
  path: 'courses/:courseId/add-task',
  name: 'AddTask',
  component: () => import('@/views/teacher/AddTask.vue')
},

      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('@/views/teacher/TaskDetail.vue'),
        props: true
      },
      {
  path: 'courses/:courseId/generate-exam',
  name: 'GenerateExam',
  component: () => import('@/views/teacher/GenerateExam.vue')
},

      {
        path: 'grades',
        name: 'GradeManagement',
        component: () => import('@/views/teacher/GradeManagement.vue')
      },
      {
        path: 'resources/:courseId',
        name: 'ResourceManagement',
        component: () => import('@/views/teacher/ResourceManagement.vue'),
        props: true
      },
      {
        path: 'courses/:courseId/knowledge-points',
        name: 'KnowledgePointManagement',
        component: () => import('@/views/teacher/KnowledgePointManagement.vue'),
        props: true
      },
      {
  path: '/teacher/tasks/:id/preview-exam',
  name: 'PreviewExam',
  component: () => import('@/views/teacher/PreviewExam.vue')
}

    ]
  },

  /* ---------- 学生端 ---------- */
  {
    path: '/student',
    component: () => import('@/views/student/StudentDashboard.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] }, // ✅ 添加权限控制
    redirect: '/student/courses',
    children: [
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('@/views/student/StudentCourses.vue')
      },
      {
        path: 'homework',
        name: 'StudentHomework',
        component: () => import('@/views/student/Homework.vue')
      },
      {
        path: 'homework/:id/submit',
        name: 'TaskSubmission',
        component: () => import('@/views/student/TaskSubmission.vue'),
        props: true
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('@/views/student/Grades.vue')
      },
      {
        path: 'performance',
        name: 'PerformanceDashboard',
        component: () => import('@/views/student/PerformanceDashboard.vue')
      },
      {
        path: 'resources',
        name: 'StudentResources',
        component: () => import('@/views/student/StudentResources.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '我的资源' }
      }
    ]
  },

  /* ---------- 公共课程详情（统一教师+学生） ---------- */
  {
    path: '/course/:id/detail',
    component: () => import('@/views/shared/CourseDetailDashboard.vue'),
    children: [
      {
        path: '',
        name: 'CourseDetail',
        component: () => import('@/views/shared/CourseDetail.vue')
      }
    ]
  },
  {
  path: '/video/:resourceId',
  name: 'VideoPlayer',
  component: () => import('@/views/shared/VideoPlayer.vue'),
  meta: { requiresAuth: true }
},

  /* ---------- 404 ---------- */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
