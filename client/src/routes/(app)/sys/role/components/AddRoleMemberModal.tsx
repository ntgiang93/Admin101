import { SearchInput } from '@/components/ui/input/SearchInput'
import { RoleHook } from '@/hooks/sys/role'
import { StringHelper } from '@/libs/StringHelper.ts'
import {
  type AddRoleMemberDto,
  defaultUserRoleCursorFilterDto,
  type RoleDto,
  type UserRoleCursorFilterDto,
} from '@/types/sys/Role'
import { type UserSelectDto } from '@/types/sys/User'
import {
  Avatar,
  Button,
  Description,
  Label,
  ListBox,
  ListLayout,
  Modal,
  ScrollShadow,
  Spinner,
  Virtualizer,
} from '@heroui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'

type Selection = Set<string> | 'all'

interface AddRoleMemberModalProps {
  role?: RoleDto
  isOpen: boolean
  onOpenChange: () => void
  onRefresh: () => void
}

export default function AddRoleMemberModal(props: AddRoleMemberModalProps) {
  const { role, isOpen, onOpenChange, onRefresh } = props
  const [filter, setFilter] = useState<UserRoleCursorFilterDto>({
    ...defaultUserRoleCursorFilterDto,
  })
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

  const { data, isFetching, refetch } = RoleHook.useGetUsersNotInRole(filter)
  const [users, setUsers] = useState<UserSelectDto[]>([])
  const [isRowLoading, setIsRowLoading] = useState<boolean>(false)
  const { mutateAsync: addMembers, isPending } = RoleHook.useAddMember()
  const parentRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async () => {
    if (!role) return
    // prepare body
    const body: AddRoleMemberDto = {
      roleId: role.id,
      userIds: Array.from(selectedKeys as Set<string>) as string[],
    }
    //excute add members
    const success = await addMembers(body)
    if (success) {
      //refresh data
      onOpenChange()
      onRefresh()
    }
  }

  // memoized selected count
  const selectedCount =
    selectedKeys === 'all'
      ? users.length || 0
      : (selectedKeys as Set<string>).size

  // Use virtualized rendering so the list stays performant even with many users.
  const rowVirtualizer = useVirtualizer({
    count: data?.hasMore ? users.length : users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  })

  const handleDataLoad = (data: UserSelectDto[]) => {
    if (!filter.cursor) {
      setUsers([...data])
    } else {
      setUsers((prev) => [...prev, ...data])
      setIsRowLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      handleDataLoad(data.items)
    }
  }, [data])

  useEffect(() => {
    setFilter((prev) => ({ ...prev, roleId: role ? role.id : prev.roleId }))
  }, [role])

  useEffect(() => {
    if (isOpen) {
      refetch().then((res) => {
        const newItems = res?.data?.items ?? []
        handleDataLoad(newItems)
      })
    } else if (!isOpen) {
      setUsers([])
      setFilter((prev) => ({ ...prev, cursor: null, setSearchValue: '' }))
      setSelectedKeys(new Set([]))
    }
  }, [isOpen])

  useEffect(() => {
    //disable isScrolling to allow loading more items
    rowVirtualizer.isScrolling = false
    //get reverse virtual items to check if last item is visible
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
    if (!lastItem) {
      return
    }
    //check if last item is visible and has more items to load
    if (lastItem.index >= users.length - 1 && data?.hasMore && !isFetching) {
      setFilter((prev) => ({
        ...prev,
        cursor: data?.nextCursor || null,
      }))
      setIsRowLoading(true)
    }
  }, [
    data?.hasMore,
    data?.nextCursor,
    users.length,
    isFetching,
    rowVirtualizer.getVirtualItems(),
  ])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                Thêm thành viên {role ? `- ${role.name}` : ''}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col p-0.5 gap-4 overflow-hidden relative">
                <SearchInput
                  value={filter.setSearchValue}
                  onValueChange={(value) => {
                    setFilter((prev) => ({
                      ...prev,
                      cursor: null,
                      setSearchValue: value,
                    }))
                  }}
                />
                <p>Đã chọn: {selectedCount} người dùng</p>
                <Virtualizer
                  layout={ListLayout}
                  layoutOptions={{ rowHeight: 48 }}
                >
                  <ListBox
                    aria-label="Virtualized list select user"
                    className="w-full h-96 p-2 border border-default rounded-md overflow-y-auto"
                    items={users}
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={(keys) =>
                      setSelectedKeys(keys as Selection)
                    }
                  >
                    {(user) => (
                      <ListBox.Item
                        id={user.id}
                        key={user.id}
                        textValue={user.userName}
                      >
                        <Avatar size="sm">
                          <Avatar.Image alt="avatar" src={user?.avatar} />
                          <Avatar.Fallback>
                            {StringHelper.getFirstLetterUpper(user?.fullName)}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Label>{user.fullName}</Label>
                          <Description>{user.email}</Description>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    )}
                  </ListBox>
                </Virtualizer>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Đóng
              </Button>
              <Button
                isDisabled={!role || selectedCount === 0}
                isPending={isPending}
                onPress={handleSubmit}
              >
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner />}
                    <span>Thêm</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
