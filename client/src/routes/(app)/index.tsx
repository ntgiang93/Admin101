import SortableColumnHeader from '@/components/ui/data-table/SortableColumnHeader'
import {
  Autocomplete,
  Chip,
  EmptyState,
  Label,
  ListBox,
  Pagination,
  SearchField,
  Table,
  useFilter,
  type SortDescriptor,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState, type Key } from 'react'

export const Route = createFileRoute('/(app)/')({
  component: App,
})

// --- Data -----------------------------------------------------------------
interface User {
  id: number
  name: string
  role: string
  status: 'Active' | 'Inactive' | 'On Leave'
  email: string
}
const statusColorMap: Record<string, 'success' | 'danger' | 'warning'> = {
  Active: 'success',
  Inactive: 'danger',
  'On Leave': 'warning',
}
const users: User[] = [
  {
    email: 'kate@acme.com',
    id: 1,
    name: 'Kate Moore',
    role: 'CEO',
    status: 'Active',
  },
  {
    email: 'john@acme.com',
    id: 2,
    name: 'John Smith',
    role: 'CTO',
    status: 'Active',
  },
  {
    email: 'sara@acme.com',
    id: 3,
    name: 'Sara Johnson',
    role: 'CMO',
    status: 'On Leave',
  },
  {
    email: 'michael@acme.com',
    id: 4,
    name: 'Michael Brown',
    role: 'CFO',
    status: 'Active',
  },
  {
    email: 'emily@acme.com',
    id: 5,
    name: 'Emily Davis',
    role: 'Product Manager',
    status: 'Inactive',
  },
  {
    email: 'davis@acme.com',
    id: 6,
    name: 'Davis Wilson',
    role: 'Lead Designer',
    status: 'Active',
  },
  {
    email: 'olivia@acme.com',
    id: 7,
    name: 'Olivia Martinez',
    role: 'Frontend Engineer',
    status: 'Active',
  },
  {
    email: 'james@acme.com',
    id: 8,
    name: 'James Taylor',
    role: 'Backend Engineer',
    status: 'Active',
  },
]
// --- TanStack Column Definitions ------------------------------------------
const columnHelper = createColumnHelper<User>()
const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('role', { header: 'Role' }),
  columnHelper.accessor('status', {
    cell: (info) => (
      <Chip color={statusColorMap[info.getValue()]} size="sm" variant="soft">
        {info.getValue()}
      </Chip>
    ),
    header: 'Status',
  }),
  columnHelper.accessor('email', { header: 'Email' }),
]
// --- Sorting Bridge -------------------------------------------------------
// Convert TanStack SortingState → React Aria SortDescriptor
function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
  const first = sorting[0]
  if (!first) return undefined
  return {
    column: first.id,
    direction: first.desc ? 'descending' : 'ascending',
  }
}
// Convert React Aria SortDescriptor → TanStack SortingState
function toSortingState(descriptor: SortDescriptor): SortingState {
  return [
    {
      desc: descriptor.direction === 'descending',
      id: descriptor.column as string,
    },
  ]
}

// --- Component ------------------------------------------------------------
const PAGE_SIZE = 4

function App() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null)
  const { contains } = useFilter({ sensitivity: 'base' })
  const items = [
    { id: 'florida', name: 'Florida' },
    { id: 'delaware', name: 'Delaware' },
    { id: 'california', name: 'California' },
    { id: 'texas', name: 'Texas' },
    { id: 'new-york', name: 'New York' },
    { id: 'washington', name: 'Washington' },
  ]
  return (
    <Autocomplete
      fullWidth
      placeholder="Select one"
      selectionMode="single"
      value={selectedKey}
      variant="secondary"
      onChange={setSelectedKey}
    >
      <Label>State</Label>
      <Autocomplete.Trigger className={'w-full'}>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search states..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            renderEmptyState={() => <EmptyState>No results found</EmptyState>}
          >
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  )
}
