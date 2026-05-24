'use client'
import { getGreeting } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Menu } from 'lucide-react'

interface HeaderProps {
  user: { email?: string }
  displayName?: string | null
}

export function Header({ displayName }: HeaderProps) {
  const now = new Date()
  const dateStr = format(now, "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-lg hover:bg-accent">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-foreground capitalize">
            {getGreeting(displayName)} 👋
          </h2>
          <p className="text-xs text-muted-foreground capitalize">{dateStr}</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  )
}
