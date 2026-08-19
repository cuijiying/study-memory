import { supabase } from '@/lib/supabase'
import type { StudyRecord } from '@/types'
import {
  buildReviewSchedule,
  COMPLETED_REVIEW_STATUS,
  formatDateTime,
  getTodayRange,
} from '@/utils/date'

export interface StudyRecordQuery {
  learningTypeId?: number
  reviewStatus: 'all' | 'complete' | 'incomplete'
  page: number
  pageSize: number
}

export interface StudyStatistics {
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  completionRate: number
}

export interface StudyActivity {
  title: string
  time: string
  type: 'success' | 'info' | 'warning' | 'primary' | 'danger'
}

export const studyRecordService = {
  async list(userId: string, query: StudyRecordQuery) {
    let request = supabase
      .from('study_records_types')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (query.learningTypeId) {
      request = request.eq('learning_type_id', query.learningTypeId)
    }

    if (query.reviewStatus === 'complete') {
      request = request.eq('review_status', COMPLETED_REVIEW_STATUS)
    } else if (query.reviewStatus === 'incomplete') {
      request = request.neq('review_status', COMPLETED_REVIEW_STATUS)
    }

    const { data, error, count } = await request
      .order('created_at', { ascending: false })
      .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1)

    if (error) throw error
    return { data: data as StudyRecord[], total: count || 0 }
  },

  async create(
    userId: string,
    record: Pick<StudyRecord, 'title' | 'description' | 'link' | 'learning_type_id'>
  ) {
    const { error } = await supabase.from('study_records').insert({
      ...record,
      user_id: userId,
      ...buildReviewSchedule(),
      review_status: '0'.repeat(5),
    })

    if (error) throw error
  },

  async update(
    userId: string,
    id: number,
    record: Pick<StudyRecord, 'title' | 'description' | 'link' | 'learning_type_id'>
  ) {
    const { error } = await supabase
      .from('study_records')
      .update(record)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },

  async updateReviewStatus(id: number, reviewStatus: string) {
    const { error } = await supabase
      .from('study_records')
      .update({ review_status: reviewStatus })
      .eq('id', id)

    if (error) throw error
  },

  async remove(id: number) {
    const { error } = await supabase.from('study_records').delete().eq('id', id)
    if (error) throw error
  },

  async getTodayStatistics(userId: string): Promise<StudyStatistics> {
    const { start, end } = getTodayRange()
    const startIso = start.toISOString()
    const endIso = end.toISOString()

    const { data, error } = await supabase
      .from('study_records')
      .select('*')
      .eq('user_id', userId)
      .or(
        `and(review1_time.gte.${startIso},review1_time.lte.${endIso}),` +
          `and(review2_time.gte.${startIso},review2_time.lte.${endIso}),` +
          `and(review3_time.gte.${startIso},review3_time.lte.${endIso}),` +
          `and(review4_time.gte.${startIso},review4_time.lte.${endIso}),` +
          `and(review5_time.gte.${startIso},review5_time.lte.${endIso})`
      )

    if (error) throw error

    const todayRecords = data || []
    let completedTasks = 0

    todayRecords.forEach((record) => {
      const status = (record.review_status || '').split('')
      const reviewTimes = [
        record.review1_time,
        record.review2_time,
        record.review3_time,
        record.review4_time,
        record.review5_time,
      ]

      const doneToday = reviewTimes.some((time, index) => {
        if (!time) return false
        const reviewTime = new Date(time)
        return reviewTime >= start && reviewTime <= end && status[index] === '1'
      })

      if (doneToday) completedTasks++
    })

    const totalTasks = todayRecords.length
    const incompleteTasks = totalTasks - completedTasks
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

    return { totalTasks, completedTasks, incompleteTasks, completionRate }
  },

  async getRecentActivities(userId: string): Promise<StudyActivity[]> {
    const { start, end } = getTodayRange()

    const [{ data: newRecords, error: newError }, { data: updatedRecords, error: updatedError }] =
      await Promise.all([
        supabase
          .from('study_records')
          .select('title, created_at, updated_at')
          .eq('user_id', userId)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        supabase
          .from('study_records')
          .select('title, created_at, updated_at')
          .eq('user_id', userId)
          .gte('updated_at', start.toISOString())
          .lte('updated_at', end.toISOString()),
      ])

    if (newError) throw newError
    if (updatedError) throw updatedError

    const activities: (StudyActivity & { timestamp: number })[] = []

    newRecords?.forEach((record) => {
      activities.push({
        title: `新增学习: ${record.title}`,
        time: formatDateTime(record.created_at),
        type: 'success',
        timestamp: new Date(record.created_at).getTime(),
      })
    })

    updatedRecords?.forEach((record) => {
      if (record.updated_at !== record.created_at) {
        activities.push({
          title: `更新笔记状态: ${record.title}`,
          time: formatDateTime(record.updated_at),
          type: 'info',
          timestamp: new Date(record.updated_at).getTime(),
        })
      }
    })

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ title, time, type }) => ({ title, time, type }))
  },
}
