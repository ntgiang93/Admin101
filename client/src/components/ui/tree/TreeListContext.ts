import { createContext, useContext } from 'react'

export type SelectionMode = 'single' | 'multiple' | 'read-only'
export type SelectionStrategy = 'all' | 'leaf'

export interface TreeContextValue {
  selectionMode?: SelectionMode
  selectionStrategy?: SelectionStrategy
  onChange: (value: string | number | (string | number)[]) => void
  values: Set<string | number>
}

export const TreeContext = createContext<TreeContextValue>({
  onChange: () => {},
  values: new Set<string | number>(),
})

export const useTreeContext = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error('useTreeContext must be used within TreeList')
  }
  return context
}
