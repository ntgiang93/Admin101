import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider'
import { RoleHook } from '@/hooks/sys/role'
import { StringHelper } from '@/libs/StringHelper'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import {
    defaultRoleMemberFilter,
    type RoleDto,
    type RoleMemberFilter,
    type RoleMembersDto,
} from '@/types/sys/Role'
import {
    AlertDialog,
    Avatar,
    Button,
    Modal,
    Spinner,
    Tooltip,
} from '@heroui/react'
import {
    AddTeamIcon,
    Delete02Icon,
    UserAccountIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import AddRoleMemberModal from './AddRoleMemberModal'

interface AssignRoleUserModalProps {
  role: RoleDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: () => void | Promise<unknown>
}

export default function AssignRoleUserModal(props: AssignRoleUserModalProps) {
  const { role, isOpen, onOpenChange, onRefresh } = props
  const roleId = role?.id || 0
  const [selectedRow, setSelectedRow] = useState<string[]>([])
  const [filter, setFilter] = useState<RoleMemberFilter>({
    ...defaultRoleMemberFilter,
  })
  const [isOpenDelete, setIsOpenDelete] = useState(false)
  const [isOpenAddMember, setIsOpenAddMember] = useState(false)

  const { data, isFetching, refetch } = RoleHook.useGetMembers(filter, isOpen)
  const { mutateAsync: removeMembers, isPending } = RoleHook.useRemoveMember(
    role.id,
  )

  const { hasPermission, navigate } = useAuth()
  const canEditRole = hasPermission(ESysModule.Roles, EPermission.Edit)

  const columns: ColumnDef<RoleMembersDto>[] = [
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: () => 'Tên',
      footer: (props) => props.column.id,
      cell: ({ row }) => {
        const avatarUrl =
          row.original.avatar ||
          `https://ui-avatars.com/api/?name=${row.original.fullName}`
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <Avatar.Image alt={row.original.fullName} src={avatarUrl} />
              <Avatar.Fallback>
                {StringHelper.getFirstLetterUpper(row.original.fullName)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {row.original.userName}
              </span>
              <span className="text-xs text-default-500">
                {row.original.fullName}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: () => 'Email',
      footer: (props) => props.column.id,
      minSize: 150,
    },
    {
      accessorKey: 'actions',
      header: 'Thao tác',
      footer: (props) => props.column.id,
      size: 100,
      cell: ({ row }) => {
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip delay={0}>
              <Button
                isIconOnly
                aria-label="user-details-button"
                variant="ghost"
                size="sm"
                onPress={() => {
                  navigate(`/sys/user/${row.original.id}`, '_blank')
                }}
              >
                <HugeiconsIcon icon={UserAccountIcon} size={16} />
              </Button>
              <Tooltip.Content>Chi tiết người dùng</Tooltip.Content>
            </Tooltip>
            {canEditRole && (
              <Tooltip delay={0}>
                <Button
                  isIconOnly
                  aria-label="remove-button"
                  variant="danger-soft"
                  size="sm"
                  onPress={() => {
                    setSelectedRow([row.original.id])
                    setIsOpenDelete(true)
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </Button>
                <Tooltip.Content>Xóa</Tooltip.Content>
              </Tooltip>
            )}
          </div>
        )
      },
      meta: {
        align: 'center',
      },
    },
  ]

  const selectedUserName = !data
    ? ([] as string[])
    : data.items
        .filter((item) => selectedRow.includes(item.id))
        .map((item) => item.fullName || item.userName)

  const handleDelete = async () => {
    if (selectedRow.length === 0 || !roleId) return
    const success = await removeMembers(selectedRow)
    if (success) {
      await refetch()
      setIsOpenDelete(false)
      setSelectedRow([])
      await Promise.resolve(onRefresh())
    }
  }

  useEffect(() => {
    if (isOpen && roleId) {
      setFilter((prev) => ({ ...prev, roleId, page: 1 }))
      setSelectedRow([])
    }
  }, [isOpen, roleId])

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow([])
      setFilter({ ...defaultRoleMemberFilter })
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size={'cover'}>
          <Modal.Dialog className={'w-3xl h-140'}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                Quản lý thành viên{role?.name ? ` - ${role.name}` : ''}
              </Modal.Heading>
              <div className="flex justify-between items-center my-1">
                <SearchInput
                  className="w-64"
                  value={filter.setSearchValue}
                  onValueChange={(value) => {
                    setFilter((prev) => ({
                      ...prev,
                      setSearchValue: value,
                    }))
                  }}
                />
                {canEditRole && (
                  <div className="flex items-center gap-2">
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        variant="primary"
                        size="sm"
                        isDisabled={!roleId}
                        onPress={() => {
                          if (!roleId) return
                          setIsOpenAddMember(true)
                        }}
                      >
                        <HugeiconsIcon icon={AddTeamIcon} size={16} />
                      </Button>
                      <Tooltip.Content>Thêm thành viên</Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        aria-label="remove-button"
                        variant="danger"
                        size="sm"
                        onPress={() => {
                          if (selectedRow.length === 0) return
                          setIsOpenDelete(true)
                        }}
                        isDisabled={selectedRow.length === 0}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </Button>
                      <Tooltip.Content>Xóa</Tooltip.Content>
                    </Tooltip>
                  </div>
                )}
              </div>
            </Modal.Header>
            <Modal.Body>
              <ClientTable
                columns={columns}
                data={data?.items || []}
                isLoading={isFetching}
                selection={{
                  selectedKeys: selectedRow,
                  onChangeSelection(value) {
                    setSelectedRow(value)
                  },
                }}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog isOpen={isOpenDelete} onOpenChange={setIsOpenDelete}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-100">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>
                  Xóa thành viên khỏi vai trò?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  Bạn chắc chắn muốn xóa{' '}
                  <strong className="text-danger">
                    {selectedUserName.join(', ')}
                  </strong>{' '}
                  khỏi vai trò này? Thao tác này không thể hoàn tác.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Hủy bỏ
                </Button>
                <Button
                  slot="close"
                  variant="danger"
                  onPress={handleDelete}
                  isPending={isPending}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? <Spinner color="current" size="sm" /> : null}
                      Xóa
                    </>
                  )}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
      <AddRoleMemberModal
        onRefresh={refetch}
        role={role}
        isOpen={isOpenAddMember}
        onOpenChange={() => setIsOpenAddMember(false)}
      />
    </Modal>
  )
}
