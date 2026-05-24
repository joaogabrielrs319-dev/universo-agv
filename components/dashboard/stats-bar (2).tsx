'use client'
import { Task, Goal, Note } from '@/types'
import { CheckSquare, Target, StickyNote, AlertCircle } from 'lucide-react'
import { isOverdue } from '@/lib/utils'

interface StatsBarProps {
  tasks: Task[]
  goals: Goal[]
  notes: Note[]
}

export function StatsBar({ tasks, goals, notes }: StatsBarProps) {
  const pending = tasks.filter(t => t.status !== 'done').length
  const overdueCount = tasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length
  const activeGoals = goals.filter(g => g.status === 'active').length
  const doneToday = tasks.filter(t => {
    if (t.status !== 'done') return false
    const updated = new Date(t.updated_at)
    const today = new Date()
    return updated.toDateString() === today.toDateString()
  }).length

  const stats = [
    { label: 'Tarefas pendentes', value: pending, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Concluídas hoje', value: doneToday, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Vencidas', value: overdueCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Metas ativas', value: activeGoals, icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Notas salvas', value: notes.length, icon: StickyNote, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
