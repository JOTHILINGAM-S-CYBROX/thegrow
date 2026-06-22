'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsWrapper({ children }) {
  useKeyboardShortcuts();
  return children;
}
