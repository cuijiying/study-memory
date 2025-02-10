import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
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
          meta: { requiresAuth: true }
        },
        {
          path: 'study-notes',
          name: 'study-notes',
          component: () => import('../views/StudyNotesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'study-plan',
          name: 'study-plan',
          component: () => import('../views/StudyPlanView.vue'),
          meta: { requiresAuth: true }
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
