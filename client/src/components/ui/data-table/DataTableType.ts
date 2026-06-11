import type { ColumnDef, RowData } from '@tanstack/react-table'

export interface SelectionConfig {
  selectedKeys: string[] | number[]
  onChangeSelection: (value: any[]) => void
}

export interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export interface tableActions {
  icon?: string
  title: string
  onClick: (cell: any) => void
}

export interface DataTableProps {
  columns: ColumnDef<any>[]
  data: any[]
  childrenProperty?: string
  selection?: SelectionConfig
  actions?: tableActions[]
  onRowClick?: (row: any) => void
  onCellClick?: (cell: any) => void
  keyColumn?: string
  isLoading?: boolean
  onRowAction?: (key: number | string | bigint) => void
  height?: number
  pagination?: PaginationState
}

export interface AsyncDataTableProps {
  columns: ColumnDef<any>[]
  data: any[]
  childrenProperty?: string
  selection?: SelectionConfig
  actions?: tableActions[]
  onRowClick?: (row: any) => void
  onCellClick?: (cell: any) => void
  keyColumn?: string
  isLoading?: boolean
  rightContent?: React.ReactNode
  leftContent?: React.ReactNode
  pagination: PaginationState
  removeWrapper?: boolean
  height?: number
}

import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'start' | 'center' | 'end' | undefined
    pinned?: 'left' | 'right' | undefined
    minWidth?: number
    width?: number
  }
}
