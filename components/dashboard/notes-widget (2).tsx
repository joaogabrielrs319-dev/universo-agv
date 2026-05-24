'use client'
import { useState } from 'react'
import { Note, NoteColor, NewNote } from '@/types'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Plus, Pin, Trash2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const NOTE_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'purple']
const COLOR_DOTS: Record<NoteColor, string> = {
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  pink: 'bg-pink-400',
  purple: 'bg-purple-400',
}

interface NotesWidgetProps {
  initialNotes: Note[]
  userId: string
}

export function NotesWidget({ initialNotes, userId }: NotesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [adding, setAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState<NoteColor>('yellow')
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  async function addNote() {
    if (!newContent.trim()) { setAdding(false); return }
    const optimistic: Note = {
      id: crypto.randomUUID(),
      user_id: userId,
      content: newContent.trim(),
      color: newColor,
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setNotes(prev => [optimistic, ...prev])
    setNewContent('')
    setAdding(false)

    const { data, error } = await supabase
      .from('notes')
      .insert({ content: optimistic.content, color: optimistic.color, pinned: false, user_id: userId })
      .select().single()

    if (error) {
      setNotes(prev => prev.filter(n => n.id !== optimistic.id))
      toast({ title: 'Erro ao salvar nota', variant: 'destructive' })
    } else {
      setNotes(prev => prev.map(n => n.id === optimistic.id ? data : n))
    }
  }

  async function togglePin(note: Note) {
    const pinned = !note.pinned
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, pinned } : n).sort((a, b) => Number(b.pinned) - Number(a.pinned)))
    await supabase.from('notes').update({ pinned }).eq('id', note.id)
  }

  async function deleteNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').delete().eq('id', id)
  }

  async function saveEdit(note: Note, content: string) {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content } : n))
    setEditingId(null)
    await supabase.from('notes').update({ content }).eq('id', note.id)
  }

  return (
    <div id="notes" className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Notas</h2>
          <p className="text-xs text-muted-foreground">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova nota
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {adding && (
          <div className="note-yellow border rounded-xl p-3 animate-fade-in">
            <div className="flex gap-1.5 mb-2">
              {NOTE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn('w-4 h-4 rounded-full transition-transform', COLOR_DOTS[c], newColor === c && 'scale-125 ring-2 ring-offset-1 ring-foreground/30')}
                />
              ))}
              <button onClick={() => setAdding(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote() }}
              placeholder="Escreva sua nota... (⌘ Enter para salvar)"
              rows={3}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <button onClick={addNote} className="mt-2 px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded-md text-xs font-medium transition">
              Salvar
            </button>
          </div>
        )}

        {notes.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma nota ainda</p>
          </div>
        )}

        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            editing={editingId === note.id}
            onEdit={() => setEditingId(note.id)}
            onSave={(content) => saveEdit(note, content)}
            onPin={() => togglePin(note)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  )
}

function NoteCard({ note, editing, onEdit, onSave, onPin, onDelete }: {
  note: Note; editing: boolean; onEdit: () => void; onSave: (c: string) => void; onPin: () => void; onDelete: () => void
}) {
  const [content, setContent] = useState(note.content)

  return (
    <div className={cn('group border rounded-xl p-3 animate-fade-in transition-all', `note-${note.color}`)}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {editing ? (
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              onBlur={() => onSave(content)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) onSave(content) }}
              rows={3}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none resize-none"
            />
          ) : (
            <p onClick={onEdit} className="text-sm text-foreground cursor-text whitespace-pre-wrap">{note.content}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
          <button onClick={onPin} className={cn('p-1 rounded transition', note.pinned ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-red-500 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
