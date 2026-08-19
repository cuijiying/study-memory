import { useAuthStore } from '@/stores/auth'

export function useAuthUser() {
  const authStore = useAuthStore()
  const userId = computed(() => authStore.user?.id ?? null)

  const requireUserId = (): string => {
    const id = userId.value
    if (!id) {
      ElMessage.error('用户未登录')
      throw new Error('NOT_AUTHENTICATED')
    }
    return id
  }

  return { userId, requireUserId }
}
