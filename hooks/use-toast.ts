'use client'
import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

let toastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null

export function useToast() {
  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    if (toastCallback) toastCallback(opts)
  }, [])
  return { toast }
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([])

  toastCallback = (opts) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...opts, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  return { toasts }
}
