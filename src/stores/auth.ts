import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  let authSubscription: { unsubscribe: () => void } | null = null

  const userId = computed(() => user.value?.id ?? null)

  const initialize = async () => {
    if (initialized.value) return

    loading.value = true
    try {
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      user.value = initialUser

      if (!authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
          user.value = session?.user ?? null
        })
        authSubscription = subscription
      }

      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    userId,
    loading,
    initialized,
    initialize,
    signOut,
  }
})
