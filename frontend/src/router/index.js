import { createRouter, createWebHistory } from 'vue-router'

// 導入 AppLayout 和 LoginView，因為它們是核心佈局
import AppLayout from '../views/AppLayout.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'AppLayout',
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'consultation',
        name: 'Consultation',
        component: () => import('../views/ConsultationView.vue')
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('../views/ChatView.vue')
      },
      {
        path: 'flock',
        name: 'SheepList',
        component: () => import('../views/SheepListView.vue')
      },
      {
        path: 'data-management',
        name: 'DataManagement',
        component: () => import('../views/DataManagementView.vue')
      },
      {
        path: 'prediction',
        name: 'Prediction',
        component: () => import('../views/PredictionView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue')
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全域導航守衛
router.beforeEach(async (to, from, next) => {
  // 使用動態導入避免循環依賴
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && localStorage.getItem('user')) {
    authStore.user = JSON.parse(localStorage.getItem('user'));
  }
  
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router