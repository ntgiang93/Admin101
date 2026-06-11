import IconButton from '@/components/ui/button/IconButton.tsx'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider'
import { UserHook } from '@/hooks/sys/user'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import {
  defaultUserTableRequest,
  type UserTableDto,
  type UserTableRequestDto,
} from '@/types/sys/User'
import { AlertDialog, Avatar, Button, Card, Chip, Tooltip } from '@heroui/react'
import {
  Add01Icon,
  Edit01Icon,
  UserAccountIcon,
  UserCheck01Icon,
  UserRemove01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import UserDetailModal from './components/UserDetailModal'
import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable'

export const Route = createFileRoute('/(app)/sys/user/')({
  component: Users,
})

function Users() {
  const [filter, setFilter] = useState<UserTableRequestDto>({
    ...defaultUserTableRequest,
    pageSize: 10,
  })
  const { data, refetch } = UserHook.useGetPagination(filter)
  const [selectedUser, setSelectedUser] = useState<UserTableDto | undefined>(
    undefined,
  )
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutateAsync: changeActive } = UserHook.useChangeActive(
    selectedUser?.id || '',
  )
  const { hasPermission } = useAuth()
  const canCreateUser = hasPermission(ESysModule.Users, EPermission.Create)
  const canEditUser = hasPermission(ESysModule.Users, EPermission.Edit)
  const canViewUser = hasPermission(ESysModule.Users, EPermission.View)
  const navigate = useNavigate()

  const columns: ColumnDef<UserTableDto>[] = [
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: () => 'Họ và tên',
      footer: (props) => props.column.id,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <Avatar.Image
                alt={row.original.fullName}
                src={
                  row.original.avatar ||
                  `https://ui-avatars.com/api/?name=${row.original.fullName}`
                }
              />
              <Avatar.Fallback>
                {row.original.fullName.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            <span>{row.original.fullName}</span>
          </div>
        )
      },
      size: 250,
      meta: {
        pinned: 'left',
      },
    },
    {
      id: 'userName',
      accessorKey: 'userName',
      header: () => 'Tài khoản',
      footer: (props) => props.column.id,
      meta: {
        pinned: 'left',
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: () => 'Email',
      footer: (props) => props.column.id,
      meta: {
        align: 'start',
      },
    },
    {
      id: 'roles',
      accessorKey: 'roles',
      header: () => 'Vai trò',
      footer: (props) => props.column.id,
      cell: ({ row }) => {
        return <span>{row.original.roles.join(' - ')}</span>
      },
      meta: {
        align: 'center',
      },
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: 'Trạng thái',
      footer: (props) => props.column.id,
      cell: ({ row }) => {
        return row.original.isLocked ? (
          <Chip color="danger" variant={'soft'}>
            Khóa
          </Chip>
        ) : row.original.isActive ? (
          <Chip color="success" variant={'soft'}>
            Hoạt động
          </Chip>
        ) : (
          <Chip color="danger" variant={'soft'}>
            Không hoạt động
          </Chip>
        )
      },
      meta: {
        align: 'center',
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
              hidden={!canViewUser}
              icon={UserAccountIcon}
              onPress={() => {
                navigate({
                  to: '/sys/user/$id',
                  params: { id: row.original.id },
                })
              }}
              tooltip={'Xem chi tiết'}
            />
            <IconButton
              hidden={!canEditUser}
              onPress={() => {
                setSelectedUser(row.original)
                setDetailOpen(true)
              }}
              icon={Edit01Icon}
              tooltip={'Sửa'}
            />
            <IconButton
              hidden={!canEditUser || !row.original.isActive}
              onPress={() => {
                setSelectedUser(row.original)
                setConfirmOpen(true)
              }}
              icon={UserRemove01Icon}
              tooltip={'Vô hiệu hóa'}
              color={'danger'}
            />
            <IconButton
              hidden={!canEditUser || row.original.isActive}
              onPress={() => {
                setSelectedUser(row.original)
                setConfirmOpen(true)
              }}
              icon={UserCheck01Icon}
              tooltip={'Kích hoạt'}
              color={'success'}
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

  const handleChangeActive = async () => {
    await changeActive(undefined)
    refetch()
    setConfirmOpen(false)
    setSelectedUser(undefined)
  }

  useEffect(() => {
    if (!detailOpen && !confirmOpen) {
      setSelectedUser(undefined)
    }
  }, [detailOpen, confirmOpen])

  return (
    <div className={'h-full w-full flex flex-col gap-2'}>
      <Card className="h-full">
        <Card.Header>
          <Card.Title>Quản lý người dùng</Card.Title>
          <div className="flex justify-between items-center w-full gap-2">
            <SearchInput
              className="w-64"
              value={''}
              onValueChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  setSearchValue: value,
                  page: 1,
                }))
              }}
            />
            <Tooltip delay={0}>
              <Button
                isIconOnly
                size={'sm'}
                onPress={() => {
                  setSelectedUser(undefined)
                  setDetailOpen(true)
                }}
                hidden={!canCreateUser}
              >
                <HugeiconsIcon icon={Add01Icon} stroke={'3'} />
              </Button>
              <Tooltip.Content>Thêm mới</Tooltip.Content>
            </Tooltip>
          </div>
        </Card.Header>
        <Card.Content>
          <AsyncDataTable
            data={data?.items || []}
            columns={columns}
            pagination={{
              page: filter.page,
              pageSize: data?.pageSize ?? filter.pageSize,
              totalPages: data?.totalPages ?? 0,
              totalCount: data?.totalCount ?? 0,
              onPageChange: (page) => {
                setFilter((prev) => ({
                  ...prev,
                  page: page + 1,
                }))
              },
              onPageSizeChange: (pageSize) => {
                setFilter((prev) => ({
                  ...prev,
                  pageSize,
                  page: 1,
                }))
              },
            }}
          />
        </Card.Content>
      </Card>
      <UserDetailModal
        isOpen={detailOpen}
        onOpenChange={() => setDetailOpen(!detailOpen)}
        onRefresh={refetch}
        id={selectedUser?.id || ''}
      />
      <AlertDialog
        isOpen={confirmOpen}
        onOpenChange={() => setConfirmOpen(!confirmOpen)}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className={'w-120'}>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {selectedUser?.isActive
                    ? 'Vô hiệu hóa người dùng'
                    : 'Kích hoạt người dùng'}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                Bạn có chắc chắn muốn{' '}
                {selectedUser?.isActive ? 'vô hiệu hóa' : 'kích hoạt'} người
                dùng <strong>{selectedUser?.fullName}</strong> (
                {selectedUser?.userName})?
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onPress={() => setConfirmOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant={selectedUser?.isActive ? 'danger' : 'primary'}
                  onPress={handleChangeActive}
                >
                  Xác nhận
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  )
}
