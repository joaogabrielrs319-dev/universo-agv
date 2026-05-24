'use client'
import { useState } from 'react'
import { Goal, NewGoal, GoalStatus } from '@/types'
import { createClient } from '@/lib/supabase'
import { cn, formatDate } from '@/lib/utils'
import { Plus, Trash2, CheckCircle2, Pause, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GoalsWidgetProps {
  initialGoals: Goal[]
  userId: string
}

export function GoalsWidget({ initialGoals, userId }: GoalsWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', target_value: '', current_value: '0', unit: '', deadline: '' })
  const { toast } = useToast()
  const supabase = createClient()

  async function addGoal() {
    if (!form.title.trim()) return
    const optimistic: Goal = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: form.title.trim(),
      target_value: form.target_value ? Number(form.target_value) : null,
      current_value: Number(form.current_value) || 0,
      unit: form.unit || null,
      deadline: form.deadline || null,
      status: 'active',
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setGoals(prev => [optimistic, ...prev])
    setForm({ title: '', target_value: '', current_value: '0', unit: '', deadline: '' })
    setAdding(false)

    const { data, error } = await supabase.from('goals')
      .insert({ title: optimistic.title, target_value: optimistic.target_value, current_value: optimistic.current_value, unit: optimistic.unit, deadline: optimistic.deadline, status: 'active', user_id: userId })
      .select().single()

    if (error) {
      setGoals(prev => prev.filter(g => g.id !== optimistic.id))
      toast({ title: 'Erro ao criar meta', variant: 'destructive' })
    } else {
      setGoals(prev => prev.map(g => g.id === optimistic.id ? data : g))
    }
  }

  async function updateProgress(goal: Goal, value: number) {
    const newVal = Math.max(0, Math.min(value, goal.target_value ?? Infinity))
    const newStatus: GoalStatus = goal.target_value && newVal >= goal.target_value ? 'completed' : goal.status === 'completed' ? 'active' : goal.status
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, current_value: newVal, status: newStatus } : g))
    await supabase.from('goals').update({ current_value: newVal, status: newStatus }).eq('id', goal.id)
  }

  async function toggleStatus(goal: Goal) {
    const newStatus: GoalStatus = goal.status === 'paused' ? 'active' : goal.status === 'active' ? 'paused' : 'active'
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: newStatus } : g))
    await supabase.from('goals').update({ status: newStatus }).eq('id', goal.id)
  }

  async function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
    await supabase.from('goals').delete().eq('id', id)
  }

  return (
    <div id="goals" className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Metas</h2>
          <p className="text-xs text-muted-foreground">{goals.filter(g => g.status === 'active').length} ativas</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova meta
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {adding && (
          <div className="p-4 bg-accent/30 space-y-2 animate-fade-in">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Nome da meta"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-3 gap-2">
              <input value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} type="number" placeholder="Atual" className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
              <input value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} type="number" placeholder="Meta" className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unidade" className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
            </div>
            <input value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} type="date" className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
              <button onClick={addGoal} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">Criar meta</button>
            </div>
          </div>
        )}

        {goals.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">Nenhuma meta ainda</p>
          </div>
        )}

        {goals.map(goal => {
          const pct = goal.target_value ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0
          return (
            <div key={goal.id} className="group px-5 py-4 hover:bg-accent/20 transition animate-fade-in">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {goal.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    <p className={cn('text-sm font-medium text-foreground', goal.status === 'paused' && 'text-muted-foreground')}>{goal.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {goal.current_value}{goal.unit ? ` ${goal.unit}` : ''}{goal.target_value ? ` / ${goal.target_value}${goal.unit ? ` ${goal.unit}` : ''}` : ''}
                    </span>
                    {goal.deadline && <span className="text-xs text-muted-foreground">• até {formatDate(goal.deadline)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => toggleStatus(goal)} className="p-1 text-muted-foreground hover:text-foreground transition">
                    {goal.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteGoal(goal.id)} className="p-1 text-muted-foreground hover:text-red-500 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {goal.target_value && (
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', goal.status === 'completed' ? 'bg-green-500' : goal.status === 'paused' ? 'bg-muted-foreground' : 'bg-primary')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{Math.round(pct)}%</p>
                    <input
                      type="number"
                      defaultValue={goal.current_value}
                      onBlur={e => updateProgress(goal, Number(e.target.value))}
                      className="w-16 text-xs text-right bg-transparent text-muted-foreground focus:outline-none focus:text-foreground"
                      min={0}
                      max={goal.target_value}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
