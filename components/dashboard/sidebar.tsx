'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, StickyNote, Bookmark, Target, LogOut, User } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard#tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/dashboard#notes', icon: StickyNote, label: 'Notas' },
  { href: '/dashboard#bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/dashboard#goals', icon: Target, label: 'Metas' },
]

interface SidebarProps {
  user: { email?: string }
  displayName?: string | null
}

export function Sidebar({ user, displayName }: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{displayName ?? 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
