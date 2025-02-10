import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const initialize = async () => {
    loading.value = true
    try {
      // Get initial session
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      user.value = initialUser
      console.log(user.value,'user')

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_, session) => {
        user.value = session?.user ?? null
      })
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    initialize
  }
}) 