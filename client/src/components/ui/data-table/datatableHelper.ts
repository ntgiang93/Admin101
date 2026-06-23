import type { Column, ColumnDef } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

// ─────────────────────────────────────────────
// Row Selection
// ─────────────────────────────────────────────

/**
 * Convert Record<rowId, boolean> → array of selected keys
 * rowId can be flat ("123") or nested path ("0.1.2") from TanStack
 * → always take the last segment as the actual key
 */
export const getSelectedItemsFromRowSelection = (
  selectedRows: Record<string, boolean>,
): Array<string | number> => {
  return Object.entries(selectedRows)
    .filter(([, isSelected]) => isSelected)
    .reduce<Array<string | number>>((acc, [path]) => {
      const raw = path.split('.').pop()?.trim()
      if (!raw) return acc

      const numeric = Number(raw)
      acc.push(Number.isNaN(numeric) ? raw : numeric)
      return acc
    }, [])
}

/**
 * Convert array of selected keys → Record<rowId, boolean>
 * used to pass into TanStack rowSelection state
 */
export const getRowSelection = (
  selectedKeys: Array<string | number>,
): Record<string, boolean> => {
  return Object.fromEntries(selectedKeys.map((key) => [key, true]))
}

// ─────────────────────────────────────────────
// Column helpers
// ─────────────────────────────────────────────

/**
 * Get the first column by priority:
 * 1. Column pinned left
 * 2. First column in array
 */
export const getFirstColumn = <TData>(
  columns: ColumnDef<TData>[],
): ColumnDef<TData> => {
  if (!columns.length) {
    throw new Error('[DataTable] columns must not be empty')
  }

  return (
    columns.find((column) => column.meta?.pinned === 'left') ?? columns[0]!
  )
}

/**
 * Calculate gridTemplateColumns string for CSS Grid
 * - meta.width  → static px (highest priority)
 * - size != 150 → static px (TanStack default is 150)
 * - else        → minmax(minWidth, 1fr) to auto-expand
 */
export const buildGridTemplate = <TData>(
  columns: Column<TData>[],
): string => {
  return columns
    .map((column) => {
      const { width, minWidth } = column.columnDef.meta ?? {}
      const sizeDef = column.columnDef.size

      // meta.width has highest priority
      if (width !== undefined) {
        return typeof width === 'number' ? `${width}px` : width
      }

      // size different from default (150) → treat as static width
      if (sizeDef !== undefined && sizeDef !== 150) {
        return `${sizeDef}px`
      }

      // Auto-expand with minWidth lower bound
      const minW =
        minWidth === undefined
          ? '0px'
          : typeof minWidth === 'number'
            ? `${minWidth}px`
            : minWidth

      return `minmax(${minW}, 1fr)`
    })
    .join(' ')
}

// ─────────────────────────────────────────────
// Pinning styles
// ─────────────────────────────────────────────

/**
 * Calculate CSSProperties for sticky pinned columns
 * - left/right pinned: position sticky + offset
 * - shadow to distinguish boundary between pinned vs scrollable
 */
export const getCommonPinningStyles = <TData>(
  column: Column<TData>,
): CSSProperties => {
  const isPinned = column.getIsPinned()

  if (!isPinned) {
    return {  }
  }

  const isLastLeft  = isPinned === 'left'  && column.getIsLastColumn('left')
  const isFirstRight = isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    position: 'sticky',
    zIndex: 2,
    left:  isPinned === 'left'  ? `${column.getStart('left')}px`  : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    boxShadow: isLastLeft
      ? '1.95px 0 2.6px 0px rgba(0,0,0,0.15)'
      : isFirstRight
        ? '-1.95px 0 2.6px 0px rgba(0,0,0,0.15)'
        : undefined,
  }
}


// ─────────────────────────────────────────────
// Checkbox class config
// ─────────────────────────────────────────────
export const tableCheckBoxClass = {
  label: 'hidden',
  hiddenInput: 'w-4',
  wrapper: 'p-0 m-0',
} as const