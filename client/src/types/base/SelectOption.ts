import type { ReactNode } from 'react'

export type SelectOptionType = {
  value: string | number
  label: string
  description?: string
  render?: (option: SelectOptionType) => ReactNode
  children?: SelectOptionType[]
}
