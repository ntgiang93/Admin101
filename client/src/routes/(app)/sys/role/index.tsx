import IconButton from '@/components/ui/button/IconButton.tsx'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import { RoleHook } from '@/hooks/sys/role'
import { StringHelper } from '@/libs/StringHelper.ts'
import RoleDetailModal from '@/routes/(app)/sys/role/components/RoleDetailModal.tsx'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import { defaultRoleDto, type RoleDto } from '@/types/sys/Role'
import { Button, Card, Tooltip } from '@heroui/react'
import {
    Delete02Icon,
    Edit01Icon,
    Plus,
    Refresh,
    SecurityLockIcon,
    ShieldCheck,
    UserMultiple02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useState } from 'react'
import AssignRoleUserModal from './components/AssignRoleUserModal'
import DeleteRoleAlert from './components/DeleteRoleAlert'
import RolePermissonModal from './components/RolePermissonModal'

export const Route = createFileRoute('/(app)/sys/role/')({
  component: Roles,
})

function Roles() {
  const { data: roles, refetch, isFetching } = RoleHook.useGetAll()
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(
    undefined,
  )
  const [searchValue, setSearchValue] = useState<string>('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [assignUserOpen, setAssignUserOpen] = useState(false)
  const [permissionOpen, setPermissionOpen] = useState(false)
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(ESysModule.Roles, EPermission.Create)
  const canEdit = hasPermission(ESysModule.Roles, EPermission.Edit)
  const canDelete = hasPermission(ESysModule.Roles, EPermission.Delete)
  const handelEditRow = useCallback((row: RoleDto) => {
    setSelectedRole(row)
    setDetailOpen(true)
  }, [])

  const columns: ColumnDef<RoleDto>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: () => 'Mã',
      footer: (props) => props.column.id,
      minSize: 150,
      meta: {
        pinned: 'left',
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: () => 'Tên',
      footer: (props) => props.column.id,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: () => 'Mô tả',
      footer: (props) => props.column.id,
    },
    {
      id: 'isProtected',
      accessorKey: 'isProtected',
      header: () => 'Bảo vệ',
      footer: (props) => props.column.id,
      cell: ({ cell }) => {
        if (cell.getValue() === true)
          return <HugeiconsIcon icon={ShieldCheck} size={16} />
        return null
      },
      meta: {
        align: 'center',
        width: 150,
      },
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      header: 'Thao tác',
      footer: (props) => props.column.id,
      cell: ({ row }) => {
        return (
          <div className="relative flex items-center gap-2">
            <IconButton
              disabled={!canEdit}
              onPress={() => {
                setSelectedRole(row.original)
                setAssignUserOpen(true)
              }}
              icon={UserMultiple02Icon}
              tooltip={'Gán người dùng'}
              color="accent"
            />
            <IconButton
              disabled={!canEdit || row.original.isProtected}
              onPress={() => {
                setSelectedRole(row.original)
                setPermissionOpen(true)
              }}
              icon={SecurityLockIcon}
              tooltip={'Phân quyền'}
              color="accent"
            />
            <IconButton
              disabled={!canEdit || row.original.isProtected}
              onPress={() => handelEditRow(row.original)}
              icon={Edit01Icon}
              tooltip={'Sửa'}
              color={'accent'}
            />
            <IconButton
              disabled={!canDelete || row.original.isProtected}
              onPress={() => {
                setSelectedRole(row.original)
                setConfirmOpen(true)
              }}
              icon={Delete02Icon}
              tooltip={'Xóa'}
              color={'danger'}
            />
          </div>
        )
      },
      meta: {
        align: 'center',
        width: 150,
      },
    },
  ]

  const handleFilter = (value: string) => {
    if (!roles) return []
    else if (StringHelper.IsNullOrEmpty(value)) {
      return roles
    } else {
      const searchValueLower = value.toLocaleLowerCase()
      return (
        roles.filter(
          (r) =>
            r.name.toLocaleLowerCase().includes(searchValueLower) ||
            r.description?.toLocaleLowerCase().includes(searchValueLower),
        ) || []
      )
    }
  }

  const tableData = handleFilter(searchValue)

  useEffect(() => {
    if (!detailOpen && !confirmOpen && !assignUserOpen && !permissionOpen) {
      setSelectedRole(undefined)
    }
  }, [detailOpen, confirmOpen, assignUserOpen, permissionOpen])

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Quản lý vai trò</Card.Title>
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
                  setSelectedRole(undefined)
                  setDetailOpen(true)
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
      <Card.Content>
        <ClientTable
          columns={columns}
          data={tableData}
          isLoading={isFetching}
        />
        <RoleDetailModal
          isOpen={detailOpen}
          onOpenChange={setDetailOpen}
          id={selectedRole?.id || 0}
          onRefresh={refetch}
        />
        <DeleteRoleAlert
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          refetch={refetch}
          selectedRole={selectedRole}
        />
        <AssignRoleUserModal
          isOpen={assignUserOpen}
          onOpenChange={setAssignUserOpen}
          role={selectedRole || { ...defaultRoleDto }}
          onRefresh={refetch}
        />
        <RolePermissonModal
          isOpen={permissionOpen}
          onOpenChange={setPermissionOpen}
          role={selectedRole || { ...defaultRoleDto }}
        />
      </Card.Content>
      <Card.Footer />
    </Card>
  )
}
