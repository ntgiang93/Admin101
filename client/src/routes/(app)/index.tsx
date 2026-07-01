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
  type SortDescriptor, Button,
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
import type {Selection} from "@heroui/react";
import {useState} from "react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ChevronRightIcon} from "@hugeicons/core-free-icons";
import {AnimatePresence, motion} from "motion/react";

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

const TableRow = motion.create(Table.Row)

// --- Component ------------------------------------------------------------
const PAGE_SIZE = 4

function App() {
  type Row = {
    children: Row[];
    date: string;
    id: string;
    title: string;
    type: string;
  };
  const data: Row[] = [
    {
      children: [
        {
          children: [
            {children: [], date: "7/10/2025", id: "3", title: "Weekly Report", type: "File"},
            {children: [], date: "8/20/2025", id: "4", title: "Budget", type: "File"},
          ],
          date: "8/2/2025",
          id: "2",
          title: "Project",
          type: "Directory",
        },
      ],
      date: "10/20/2025",
      id: "1",
      title: "Documents",
      type: "Directory",
    },
    {
      children: [
        {children: [], date: "1/23/2026", id: "6", title: "Image 1", type: "File"},
        {children: [], date: "2/3/2026", id: "7", title: "Image 2", type: "File"},
      ],
      date: "2/3/2026",
      id: "5",
      title: "Photos",
      type: "Directory",
    },
  ];
  const [expandedKeys, setExpandedKeys] = useState<Selection>(() => new Set(["1"]));
  const renderExpandableRow = (item: Row) => {
    return (
        <AnimatePresence>
          <TableRow id={item.id} textValue={item.title}
                    key={item.id}
                    initial={ {opacity: 0, height: 0} }
                    animate={ { opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 } }
                    transition={
                      { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
                    }
          >
            <Table.Cell textValue={item.title}>
              {({hasChildItems, isDisabled, isExpanded, isTreeColumn}) => (
                  <span className="flex items-center gap-1">
              {hasChildItems && isTreeColumn ? (
                  <Button
                      isIconOnly
                      aria-label="Toggle row"
                      isDisabled={isDisabled}
                      size="sm"
                      slot="chevron"
                      variant="ghost"
                  >
                    <HugeiconsIcon icon={ChevronRightIcon}/>
                  </Button>
              ) : null}
                    <span>{item.title}</span>
            </span>
              )}
            </Table.Cell>
            <Table.Cell>{item.type}</Table.Cell>
            <Table.Cell>{item.date}</Table.Cell>
            <Table.Collection items={item.children}>{renderExpandableRow}</Table.Collection>
          </TableRow>
          
        </AnimatePresence>
    );
  };
  return (
      <Table>
        <Table.ScrollContainer>
          <Table.Content
              aria-label="Files"
              className="min-w-[520px]"
              expandedKeys={expandedKeys}
              treeColumn="name"
              onExpandedChange={setExpandedKeys}
          >
            <Table.Header>
              <Table.Column isRowHeader id="name">
                Name
              </Table.Column>
              <Table.Column id="type">Type</Table.Column>
              <Table.Column id="date">Date Modified</Table.Column>
            </Table.Header>
            <Table.Body items={data}>{renderExpandableRow}</Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
  );
}
