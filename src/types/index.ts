export interface StudyRecord {
  id: number
  // category: string
  title: string
  description: string
  link: string
  created_at: string
  updated_at: string
  learning_type_id: number | undefined
  learning_type?: LearningType
  name?: string
  review1_time?: string
  review2_time?: string
  review3_time?: string
  review4_time?: string
  review5_time?: string
  review_status?: string
}

export type StudyPlanStatus = 'not_started' | 'in_progress' | 'completed'
export type StudyPlanPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface StudyPlan {
  id: number
  user_id?: string
  title: string
  description: string
  start_time: string | null
  end_time: string | null
  status: StudyPlanStatus
  priority: StudyPlanPriority
  learning_type_id: number | null
  learning_type_name?: string
  learning_type_description?: string
  /** @deprecated 旧视图字段，请使用 learning_type_name */
  name?: string
  learning_type?: LearningType
  unit_number: number | null
  week_number: number | null
  created_at: string
  updated_at: string
}

export interface StudyPlanUnitGroup {
  id: string
  isUnit: true
  title: string
  unit_number: number | null
  children: StudyPlan[]
}

export type StudyPlanTreeRow = StudyPlanUnitGroup | (StudyPlan & { isUnit?: false })

export interface LearningType {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
} 