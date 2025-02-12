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
  review1_time?: string
  review2_time?: string
  review3_time?: string
  review4_time?: string
  review5_time?: string
  review_status?: string
}

export interface StudyPlan {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  learning_type_id: number
  name: string
  learning_type?: LearningType
  created_at: string
  updated_at: string
}

export interface LearningType {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
} 