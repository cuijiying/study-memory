import { supabase } from '@/lib/supabase'
import type { StudyPlan, StudyPlanStatus, StudyPlanPriority } from '@/types'

export interface StudyPlanQuery {
  learningTypeId?: number
  status?: 'all' | StudyPlanStatus
  priority?: 'all' | StudyPlanPriority
  unitNumber?: number
  weekNumber?: number
}

const VIEW_NAME = 'study_plan_with_type'

export const studyPlanService = {
  async list(userId: string, query: StudyPlanQuery) {
    let request = supabase.from(VIEW_NAME).select('*').eq('user_id', userId)

    if (query.learningTypeId) {
      request = request.eq('learning_type_id', query.learningTypeId)
    }
    if (query.status && query.status !== 'all') {
      request = request.eq('status', query.status)
    }
    if (query.priority && query.priority !== 'all') {
      request = request.eq('priority', query.priority)
    }
    if (query.unitNumber != null) {
      request = request.eq('unit_number', query.unitNumber)
    }
    if (query.weekNumber != null) {
      request = request.eq('week_number', query.weekNumber)
    }

    const { data, error } = await request
      .order('unit_number', { ascending: true, nullsFirst: false })
      .order('week_number', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data as StudyPlan[], total: data?.length ?? 0 }
  },

  async create(
    userId: string,
    plan: Pick<
      StudyPlan,
      | 'title'
      | 'description'
      | 'start_time'
      | 'end_time'
      | 'status'
      | 'priority'
      | 'learning_type_id'
      | 'unit_number'
      | 'week_number'
    >
  ) {
    const { error } = await supabase.from('study_plan').insert([{ ...plan, user_id: userId }])
    if (error) throw error
  },

  async update(id: number, plan: Partial<StudyPlan>) {
    const {
      id: _id,
      user_id,
      created_at,
      updated_at,
      learning_type,
      learning_type_name,
      learning_type_description,
      name,
      isUnit,
      children,
      ...updates
    } = plan as Partial<StudyPlan> & {
      isUnit?: boolean
      children?: unknown
    }
    const { error } = await supabase.from('study_plan').update(updates).eq('id', id)
    if (error) throw error
  },

  async updateStatus(id: number, status: StudyPlanStatus) {
    const { error } = await supabase.from('study_plan').update({ status }).eq('id', id)
    if (error) throw error
  },

  async remove(id: number) {
    const { error } = await supabase.from('study_plan').delete().eq('id', id)
    if (error) throw error
  },
}
