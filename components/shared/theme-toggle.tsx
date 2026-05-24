'use client'
import { useTheme } from './theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition"
      title={`Tema: ${theme}`}
    >
      {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
    </button>
  )
}
