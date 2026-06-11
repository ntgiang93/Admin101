import IconButton from '@/components/ui/button/IconButton'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import { DepartmentHook } from '@/hooks/orgazination/department'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import { type DepartmentDto } from '@/types/sys/Department'
import { Button, Card, Tooltip } from '@heroui/react'
import {
    Add01Icon,
    Delete02Icon,
    Edit01Icon,
    Plus,
    Refresh,
    UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import DeleteDepartmentAlert from './components/DeleteDepartmentAlert'
import DetailModal from './components/DetailModal'
import MemberModal from './components/MemberModal'

export const Route = createFileRoute('/(app)/organization/department/')({
  component: DepartmentsPage,
})

function DepartmentsPage() {
  const { data, refetch, isLoading } = DepartmentHook.useGetAll()
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [isOpenAssign, setIsOpenAssign] = useState(false)
  const [selected, setSelected] = useState<DepartmentDto | undefined>(undefined)
  const [selectedParent, setSelectedParent] = useState<
    DepartmentDto | undefined
  >(undefined)
  const [searchValue, setSearchValue] = useState<string>('')
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(ESysModule.Department, EPermission.Create)
  const canEdit = hasPermission(ESysModule.Department, EPermission.Edit)
  const canDelete = hasPermission(ESysModule.Department, EPermission.Delete)

  const columns = useMemo<ColumnDef<DepartmentDto>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => 'Tên',
        meta: {
          pinned: 'left',
          width: 250,
        },
      },
      {
        id: 'code',
        accessorKey: 'code',
        header: () => 'Mã',
      },
      {
        accessorKey: 'description',
        header: () => 'Mô tả',
        meta: {
          align: 'start',
        },
      },
      {
        id: 'departmentTypeName',
        accessorKey: 'departmentTypeName',
        header: () => 'Loại phòng ban',
      },
      {
        id: 'address',
        accessorKey: 'address',
        header: () => 'Địa chỉ',
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: () => 'Thao tác',
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <IconButton
                disabled={!canCreate}
                icon={Add01Icon}
                tooltip="Thêm"
                onPress={() => {
                  setSelected(undefined)
                  setSelectedParent(row.original)
                  setIsOpen(true)
                }}
              />
              <IconButton
                disabled={!canEdit}
                icon={Edit01Icon}
                tooltip="Sửa"
                onPress={() => {
                  setSelected(row.original)
                  setSelectedParent(undefined)
                  setIsOpen(true)
                }}
                color="accent"
              />
              <IconButton
                disabled={!canEdit}
                icon={UserGroupIcon}
                tooltip="Quản lý thành viên"
                onPress={() => {
                  setSelected(row.original)
                  setIsOpenAssign(true)
                }}
              />
              <IconButton
                disabled={
                  !canDelete ||
                  (!!row.original.children && row.original.children.length > 0)
                }
                icon={Delete02Icon}
                tooltip="Xóa"
                onPress={() => {
                  setSelected(row.original)
                  setSelectedParent(undefined)
                  setIsOpenDel(true)
                }}
                color="danger"
              />
            </div>
          )
        },
        meta: {
          align: 'center',
          pinned: 'right',
          width: 150,
        },
      },
    ],
    [canCreate, canEdit, canDelete],
  )

  const filteredData = useMemo(() => {
    if (!data) return []

    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return data
    }

    const filterNodes = (nodes: DepartmentDto[]): DepartmentDto[] => {
      return nodes.reduce<DepartmentDto[]>((acc, node) => {
        const filteredChildren = node.children ? filterNodes(node.children) : []
        const nodeMatches = [
          node.name,
          node.code,
          node.description,
          node.departmentTypeName,
          node.address,
        ].some((field) =>
          field ? field.toLowerCase().includes(keyword) : false,
        )

        if (nodeMatches) {
          acc.push({
            ...node,
            ...(node.children
              ? {
                  children:
                    filteredChildren.length > 0
                      ? filteredChildren
                      : node.children,
                }
              : {}),
          })
          return acc
        }

        if (filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          })
        }

        return acc
      }, [])
    }

    return filterNodes(data as DepartmentDto[])
  }, [data, setSearchValue])

  const onResetSelected = () => {
    setSelected(undefined)
    setSelectedParent(undefined)
  }

  return (
    <Card className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>Quản lý phòng ban</Card.Title>
        <div className="flex justify-between items-center my-1">
          <SearchInput
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
          />
          <div className="flex gap-2">
            <Tooltip delay={0}>
              <Button
                hidden={!canCreate}
                isIconOnly
                onPress={() => {
                  setSelected(undefined)
                  setSelectedParent(undefined)
                  setIsOpen(true)
                }}
              >
                <HugeiconsIcon icon={Plus}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Thêm mới</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                <HugeiconsIcon icon={Refresh}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Tải lại dữ liệu</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </Card.Header>
      <Card.Content className="flex-1 min-h-0">
        <ClientTable
          columns={columns}
          data={filteredData || []}
          childrenProperty="children"
          isLoading={isLoading}
        />
      </Card.Content>
      <Card.Footer />
      <DetailModal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        id={selected?.id || 0}
        onRefresh={refetch}
        onResetSelected={onResetSelected}
        parent={selectedParent}
      />
      <MemberModal
        department={selected}
        isOpen={isOpenAssign}
        onOpenChange={() => setIsOpenAssign(!isOpenAssign)}
        onRefresh={refetch}
      />
      <DeleteDepartmentAlert
        isOpen={isOpenDel}
        onOpenChange={(open) => {
          setIsOpenDel(open)
          if (!open) onResetSelected()
        }}
        selectedDepartment={selected}
        refetch={refetch}
      />
    </Card>
  )
}
