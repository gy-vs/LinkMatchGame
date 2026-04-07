import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/store/admin'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'levels',
        name: 'Levels',
        component: () => import('@/views/levels/index.vue'),
        meta: { title: '关卡管理', icon: 'Grid' }
      },
      {
        path: 'records',
        name: 'Records',
        component: () => import('@/views/records/index.vue'),
        meta: { title: '游戏记录', icon: 'Document' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人信息', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const adminStore = useAdminStore()
  
  if (to.meta.requiresAuth === false) {
    next()
  } else if (!adminStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
