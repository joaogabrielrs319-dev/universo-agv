'use client'
import { useState, useOptimistic, useTransition } from 'react'
import { Task, Priority, TaskStatus, NewTask } from '@/types'
import { createClient } from '@/lib/supabase'
import { cn, priorityLabel, formatDate, isOverdue } from '@/lib/utils'
import { Plus, Trash2, ChevronDown, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

interface TasksWidgetProps {
  initialTasks: Task[]
  userId: string
}

export function TasksWidget({ initialTasks, userId }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const supabase = createClient()

  const filtered = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  }).sort((a, b) => {
    const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority as Priority] - order[b.priority as Priority]
  })

  async function addTask() {
    if (!newTitle.trim()) return
    const optimistic: Task = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: newTitle.trim(),
      priority: newPriority,
      status: 'pending',
      due_date: newDueDate || null,
      tags: [],
      position: tasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [optimistic, ...prev])
    setNewTitle('')
    setNewDueDate('')
    setAdding(false)

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: optimistic.title, priority: optimistic.priority, status: 'pending', due_date: optimistic.due_date || null, user_id: userId, tags: [], position: tasks.length })
      .select()
      .single()

    if (error) {
      setTasks(prev => prev.filter(t => t.id !== optimistic.id))
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' })
    } else {
      setTasks(prev => prev.map(t => t.id === optimistic.id ? data : t))
    }
  }

  async function toggleTask(task: Task) {
    const newStatus: TaskStatus = task.status === 'done' ? 'pending' : 'done'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  return (
    <div id="tasks" className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-foreground">Tarefas</h2>
            <p className="text-xs text-muted-foreground">{tasks.filter(t => t.status !== 'done').length} pendentes</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova tarefa
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'in_progress', 'done'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition',
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendentes' : s === 'in_progress' ? 'Em andamento' : 'Concluídas'}
            </button>
          ))}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as 'all' | Priority)}
            className="ml-auto px-2 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground focus:outline-none"
          >
            <option value="all">Prioridade</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {adding && (
        <div className="px-5 py-3 border-b border-border bg-accent/30">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Nome da tarefa..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mb-2"
          />
          <div className="flex gap-2 items-center">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as Priority)}
              className="px-2 py-1 bg-card border border-border rounded-md text-xs text-foreground focus:outline-none"
            >
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="px-2 py-1 bg-card border border-border rounded-md text-xs text-foreground focus:outline-none"
            />
            <div className="ml-auto flex gap-2">
              <button onClick={() => setAdding(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition">Cancelar</button>
              <button onClick={addTask} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada</p>
          </div>
        )}
        {filtered.map(task => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (t: Task) => void; onDelete: (id: string) => void }) {
  const done = task.status === 'done'
  const overdue = isOverdue(task.due_date) && !done

  return (
    <div className={cn('group flex items-start gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors animate-fade-in', done && 'opacity-60')}>
      <button
        onClick={() => onToggle(task)}
        className={cn(
          'mt-0.5 w-4.5 h-4.5 rounded border-2 shrink-0 flex items-center justify-center transition-all',
          done ? 'bg-green-500 border-green-500' : 'border-border hover:border-primary'
        )}
        style={{ width: 18, height: 18 }}
      >
        {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-foreground', done && 'line-through text-muted-foreground')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('inline-flex px-1.5 py-0.5 rounded text-xs font-medium border', PRIORITY_COLORS[task.priority as Priority])}>
            {priorityLabel(task.priority)}
          </span>
          {task.due_date && (
            <span className={cn('text-xs', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
              {overdue ? '⚠ ' : ''}{formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-muted-foreground transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
