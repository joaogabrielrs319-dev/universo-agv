'use client'
import { useState } from 'react'
import { Bookmark } from '@/types'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, ExternalLink, Search } from 'lucide-react'
import { getFaviconUrl } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface BookmarksWidgetProps {
  initialBookmarks: Bookmark[]
  userId: string
}

export function BookmarksWidget({ initialBookmarks, userId }: BookmarksWidgetProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', category: '', description: '' })
  const { toast } = useToast()
  const supabase = createClient()

  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.url.toLowerCase().includes(search.toLowerCase()) ||
    (b.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Bookmark[]>>((acc, b) => {
    const cat = b.category ?? 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(b)
    return acc
  }, {})

  async function addBookmark() {
    if (!form.title.trim() || !form.url.trim()) return
    let url = form.url.trim()
    if (!url.startsWith('http')) url = 'https://' + url

    const optimistic: Bookmark = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: form.title.trim(),
      url,
      description: form.description || null,
      category: form.category || null,
      favicon_url: getFaviconUrl(url),
      created_at: new Date().toISOString(),
    }
    setBookmarks(prev => [optimistic, ...prev])
    setForm({ title: '', url: '', category: '', description: '' })
    setAdding(false)

    const { data, error } = await supabase.from('bookmarks')
      .insert({ title: optimistic.title, url: optimistic.url, description: optimistic.description, category: optimistic.category, favicon_url: optimistic.favicon_url, user_id: userId })
      .select().single()

    if (error) {
      setBookmarks(prev => prev.filter(b => b.id !== optimistic.id))
      toast({ title: 'Erro ao salvar bookmark', variant: 'destructive' })
    } else {
      setBookmarks(prev => prev.map(b => b.id === optimistic.id ? data : b))
    }
  }

  async function deleteBookmark(id: string) {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  return (
    <div id="bookmarks" className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-foreground">Bookmarks</h2>
            <p className="text-xs text-muted-foreground">{bookmarks.length} salvos</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Salvar link
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar bookmarks..."
            className="w-full pl-8 pr-3 py-2 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {adding && (
          <div className="p-4 bg-accent/30 border-b border-border space-y-2 animate-fade-in">
            <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="URL" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Categoria (opcional)" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
              <button onClick={addBookmark} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">Salvar</button>
            </div>
          </div>
        )}

        {Object.keys(grouped).length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">{search ? 'Nenhum resultado' : 'Nenhum bookmark ainda'}</p>
          </div>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="px-5 py-2 bg-muted/50 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
            </div>
            <div className="divide-y divide-border">
              {items.map(bookmark => (
                <div key={bookmark.id} className="group flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition animate-fade-in">
                  {bookmark.favicon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bookmark.favicon_url} alt="" className="w-4 h-4 rounded-sm shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-4 h-4 bg-muted rounded-sm shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{bookmark.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="p-1 text-muted-foreground hover:text-primary transition">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => deleteBookmark(bookmark.id)} className="p-1 text-muted-foreground hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
