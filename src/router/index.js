import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

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
      // 可以继续扩展更多管理员子模块，比如课程管理、审核功能等
    ]
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
      // 添加任务路由
      {
        path: 'tasks/add',
        name: 'AddTask',
        component: () => import('../views/teacher/AddTask.vue')
      },

      // 任务管理页面
      {
        path: 'tasks',
        name: 'TaskManagement',
        component: () => import('../views/teacher/TaskManagement.vue')
      },

      // 任务详情页面
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('../views/teacher/TaskDetail.vue'),
        props: true
      },
      {
        path: 'grades',
        name: 'GradeManagement',
        component: () => import('../views/teacher/GradeManagement.vue')
      },
      {
        path: 'resources/:courseId',
        name: 'ResourceManagement',
        component: () => import('../views/teacher/ResourceManagement.vue'),
        props: true
      },
      {
        path: 'tasks/generate/:id',
        name: 'GenerateExam',
        component: () => import('../views/teacher/GenerateExam.vue')
      },
      {
        path: '/teacher/courses/:courseId/knowledge-points',
        name: 'KnowledgePointManagement',
        component: () => import('@/views/teacher/KnowledgePointManagement.vue'),
        props: true
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
        component: () => import('../views/student/StudentCourses.vue')
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
      },
      {
        path: '/student/resources',
        name: 'StudentResources',
        component: () => import('../views/student/StudentResources.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '我的资源' }
      }
    ]
  },

  /* ---------- 404 ---------- */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


export default router;
