import { supabase } from '@/lib/supabase'

export interface Issue {
  issue_id: number
  user_id?: string
  title: string
  issue_type: string
  description: string
  status: '待处理' | '处理中' | '已解决'
  priority: '高' | '中' | '低'
  created_at: string
  updated_at: string
  solution: string | null
  cause: string | null
  preventive_measures: string | null
  resolution_time: string | null
}

type IssueInput = Omit<Issue, 'issue_id' | 'created_at' | 'updated_at' | 'user_id'>
type IssueUpdate = Partial<IssueInput>

export const issueService = {
  async getIssues(userId: string) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Issue[]
  },

  async getIssueById(userId: string, id: number) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data as Issue
  },

  async createIssue(userId: string, issue: IssueInput) {
    const { data, error } = await supabase
      .from('issues')
      .insert([{ ...issue, user_id: userId }])
      .select()

    if (error) throw error
    return data[0] as Issue
  },

  async updateIssue(userId: string, id: number, issue: IssueUpdate) {
    const { data, error } = await supabase
      .from('issues')
      .update(issue)
      .eq('issue_id', id)
      .eq('user_id', userId)
      .select()

    if (error) throw error
    return data[0] as Issue
  },

  async deleteIssue(userId: string, id: number) {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('issue_id', id)
      .eq('user_id', userId)

    if (error) throw error
  },
}
