import { create } from 'zustand'
import { Task, Note, Bookmark, Goal } from '@/types'

interface DashboardStore {
  tasks: Task[]
  notes: Note[]
  bookmarks: Bookmark[]
  goals: Goal[]
  taskFilter: 'all' | 'pending' | 'in_progress' | 'done'
  taskPriority: 'all' | 'urgent' | 'high' | 'medium' | 'low'
  sidebarOpen: boolean

  setTasks: (tasks: Task[]) => void
  setNotes: (notes: Note[]) => void
  setBookmarks: (bookmarks: Bookmark[]) => void
  setGoals: (goals: Goal[]) => void
  setTaskFilter: (f: DashboardStore['taskFilter']) => void
  setTaskPriority: (p: DashboardStore['taskPriority']) => void
  toggleSidebar: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  tasks: [],
  notes: [],
  bookmarks: [],
  goals: [],
  taskFilter: 'all',
  taskPriority: 'all',
  sidebarOpen: false,

  setTasks: (tasks) => set({ tasks }),
  setNotes: (notes) => set({ notes }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setGoals: (goals) => set({ goals }),
  setTaskFilter: (taskFilter) => set({ taskFilter }),
  setTaskPriority: (taskPriority) => set({ taskPriority }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
