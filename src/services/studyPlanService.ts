import { supabase } from '@/lib/supabase'
import type { StudyPlan } from '@/types'

export interface StudyPlanQuery {
  page: number
  pageSize: number
}

export const studyPlanService = {
  async list(userId: string, query: StudyPlanQuery) {
    const [{ count, error: countError }, { data, error }] = await Promise.all([
      supabase
        .from('study_plan')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('study_plan_types')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1),
    ])

    if (countError) throw countError
    if (error) throw error

    return { data: data as StudyPlan[], total: count || 0 }
  },

  async create(
    userId: string,
    plan: Pick<
      StudyPlan,
      'title' | 'description' | 'start_time' | 'end_time' | 'status' | 'priority' | 'learning_type_id'
    >
  ) {
    const { error } = await supabase.from('study_plan').insert([{ ...plan, user_id: userId }])
    if (error) throw error
  },

  async update(id: number, plan: Partial<StudyPlan>) {
    const { name, id: _id, created_at, updated_at, learning_type, ...updates } = plan
    const { error } = await supabase.from('study_plan').update(updates).eq('id', id)
    if (error) throw error
  },

  async remove(id: number) {
    const { error } = await supabase.from('study_plan').delete().eq('id', id)
    if (error) throw error
  },
}
