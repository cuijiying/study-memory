import { supabase } from '@/lib/supabase'

export interface Issue {
  issue_id: number
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

export const issueService = {
  async getIssues() {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Issue[]
  },

  async getIssueById(id: number) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_id', id)
      .single()
    
    if (error) throw error
    return data as Issue
  },

  async createIssue(issue: Omit<Issue, 'issue_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('issues')
      .insert([issue])
      .select()
    
    if (error) throw error
    return data[0] as Issue
  },

  async updateIssue(id: number, issue: Partial<Omit<Issue, 'issue_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('issues')
      .update(issue)
      .eq('issue_id', id)
      .select()
    
    if (error) throw error
    return data[0] as Issue
  },

  async deleteIssue(id: number) {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('issue_id', id)
    
    if (error) throw error
  }
} 