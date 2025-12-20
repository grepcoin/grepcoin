'use client'

import { ReactNode } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  useKeyboardShortcuts()

  return (
    <>
      {children}
      <KeyboardShortcutsModal />
    </>
  )
}
