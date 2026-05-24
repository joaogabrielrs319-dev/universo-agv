import { createClient } from '@/lib/supabase-server'
import { TasksWidget } from '@/components/todo/tasks-widget'
import { NotesWidget } from '@/components/dashboard/notes-widget'
import { GoalsWidget } from '@/components/dashboard/goals-widget'
import { BookmarksWidget } from '@/components/dashboard/bookmarks-widget'
import { StatsBar } from '@/components/dashboard/stats-bar'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: tasks },
    { data: notes },
    { data: bookmarks },
    { data: goals },
  ] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).order('position'),
    supabase.from('notes').select('*').eq('user_id', user.id).order('pinned', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsBar
        tasks={tasks ?? []}
        goals={goals ?? []}
        notes={notes ?? []}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TasksWidget initialTasks={tasks ?? []} userId={user.id} />
        </div>
        <div className="lg:col-span-2">
          <NotesWidget initialNotes={notes ?? []} userId={user.id} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsWidget initialGoals={goals ?? []} userId={user.id} />
        <BookmarksWidget initialBookmarks={bookmarks ?? []} userId={user.id} />
      </div>
    </div>
  )
}
