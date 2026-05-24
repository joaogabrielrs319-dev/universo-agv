export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
export type GoalStatus = 'active' | 'completed' | 'paused'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  due_date?: string | null
  tags: string[]
  position: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  content: string
  color: NoteColor
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  description?: string | null
  category?: string | null
  favicon_url?: string | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string | null
  target_value?: number | null
  current_value: number
  unit?: string | null
  deadline?: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  display_name?: string | null
  theme: 'light' | 'dark' | 'system'
  dashboard_layout: Record<string, unknown>
  widgets_enabled: string[]
  created_at: string
  updated_at: string
}

export type NewTask = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type NewNote = Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type NewBookmark = Omit<Bookmark, 'id' | 'user_id' | 'created_at'>
export type NewGoal = Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
