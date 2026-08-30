import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { LearningType } from '@/types'

export const useLearningTypeStore = defineStore('learningType', () => {
  const authStore = useAuthStore()
  const learningTypes = ref<LearningType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function requireUserId(): string {
    const userId = authStore.userId
    if (!userId) {
      throw new Error('NOT_AUTHENTICATED')
    }
    return userId
  }

  async function fetchLearningTypes() {
    try {
      loading.value = true
      error.value = null

      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('learning_types')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err
      learningTypes.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取学习类型失败'
    } finally {
      loading.value = false
    }
  }

  async function createLearningType(type: Pick<LearningType, 'name' | 'description'>) {
    try {
      loading.value = true
      error.value = null

      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('learning_types')
        .insert([{ ...type, user_id: userId }])
        .select()
        .single()

      if (err) throw err
      learningTypes.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建学习类型失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLearningType(id: number, type: Partial<Pick<LearningType, 'name' | 'description'>>) {
    try {
      loading.value = true
      error.value = null

      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('learning_types')
        .update(type)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (err) throw err
      const index = learningTypes.value.findIndex(t => t.id === id)
      if (index !== -1) {
        learningTypes.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新学习类型失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLearningType(id: number) {
    try {
      loading.value = true
      error.value = null

      const userId = requireUserId()
      const { error: err } = await supabase
        .from('learning_types')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (err) throw err
      learningTypes.value = learningTypes.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除学习类型失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    learningTypes,
    loading,
    error,
    fetchLearningTypes,
    createLearningType,
    updateLearningType,
    deleteLearningType,
  }
})
