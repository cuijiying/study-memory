import { supabase } from '@/lib/supabase'
import type { LearningType } from '@/types'

export const useLearningTypeStore = defineStore('learningType', () => {
  const learningTypes = ref<LearningType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有学习类型
  async function fetchLearningTypes() {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase
        .from('learning_types')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      learningTypes.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取学习类型失败'
    } finally {
      loading.value = false
    }
  }

  // 创建学习类型
  async function createLearningType(type: Pick<LearningType, 'name' | 'description'>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('learning_types')
        .insert([type])
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

  // 更新学习类型
  async function updateLearningType(id: number, type: Partial<Pick<LearningType, 'name' | 'description'>>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('learning_types')
        .update(type)
        .eq('id', id)
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

  // 删除学习类型
  async function deleteLearningType(id: number) {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('learning_types')
        .delete()
        .eq('id', id)

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
    deleteLearningType
  }
}) 