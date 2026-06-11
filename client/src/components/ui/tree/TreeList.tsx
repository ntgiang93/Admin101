import { ScrollShadow } from '@heroui/react'
import {
  type SelectionMode,
  type SelectionStrategy,
  TreeContext,
} from '@/components/ui/tree/TreeListContext.ts'
import { type ReactNode } from 'react'

export interface TreeListProps {
  children: ReactNode
  className?: string
  values: (string | number)[] | string | number
  onChange: (value: string | number | (string | number)[]) => void
  selectionMode?: SelectionMode
  selectionStrategy?: SelectionStrategy
}

const TreeList = (props: TreeListProps) => {
  const {
    children,
    className,
    selectionStrategy,
    selectionMode,
    values,
    onChange,
  } = props

  const newValues = new Set<any>(Array.isArray(values) ? values : [values])

  const contextValue = {
    selectionMode,
    selectionStrategy,
    onChange,
    values: newValues,
  }

  return (
    <TreeContext.Provider value={contextValue}>
      <ScrollShadow className={className}>{children}</ScrollShadow>
    </TreeContext.Provider>
  )
}

export default TreeList
