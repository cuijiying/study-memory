import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false, hideInMenu: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false, hideInMenu: true }
    },
    {
      path: '/',
      name: 'layout',
      component: () => import('../layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: { requiresAuth: true, title: '首页' }
        },
        {
          path: 'study-notes',
          name: 'study-notes',
          component: () => import('../views/StudyNotesView.vue'),
          meta: { requiresAuth: true, title: '学习笔记' }
        },
        {
          path: 'study-plan',
          name: 'study-plan',
          component: () => import('../views/StudyPlanView.vue'),
          meta: { requiresAuth: true, title: '学习计划' }
        },
        {
          path: 'learning-types',
          name: 'learning-types',
          component: () => import('../views/LearningTypeView.vue'),
          meta: { requiresAuth: true, title: '学习类型' }
        },
        {
          path: 'issues',
          name: 'issues',
          component: () => import('../views/IssuesView.vue'),
          meta: { requiresAuth: true, title: '问题管理' }
        },
        {
          path: 'issues/:id',
          name: 'issue-detail',
          component: () => import('../views/IssueDetailView.vue'),
          meta: { requiresAuth: true, title: '问题详情', hideInMenu: true }
        },
        {
          path: 'stock-market',
          name: 'stock-market',
          component: () => import('../views/StockMarketView.vue'),
          meta: { requiresAuth: true, title: '股票市场' }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !user) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && user) {
    next('/')
  } else {
    next()
  }
})

export default router
