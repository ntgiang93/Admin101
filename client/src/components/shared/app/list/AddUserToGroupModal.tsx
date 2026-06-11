import { SearchInput } from '@/components/ui/input/SearchInput'
import { RoleHook } from '@/hooks/sys/role'
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
  ListBox,
  Modal,
  ScrollShadow,
  Spinner,
} from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StringHelper } from '@/libs/StringHelper.ts'
import clsx from 'clsx'

type Selection = Set<string> | 'all'

interface AddRoleMemberModalProps {
  role?: RoleDto
  isOpen: boolean
  onOpenChange: () => void
  onRefresh: () => void
  isLoading?: boolean
}

export default function AddRoleMemberModal(props: AddRoleMemberModalProps) {
  const { role, isOpen, onOpenChange, onRefresh } = props
  const [filter, setFilter] = useState<UserRoleCursorFilterDto>({
    ...defaultUserRoleCursorFilterDto,
  })
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

  const { data, isFetching } = RoleHook.useGetUsersNotInRole(filter)
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

  useEffect(() => {
    if (data) {
      if (!filter.cursor) {
        setUsers([...data.items])
      } else {
        setUsers((prev) => [...prev, ...data.items])
        setIsRowLoading(false)
      }
    }
  }, [data, filter.cursor])

  useEffect(() => {
    if (role && isOpen) {
      setFilter((prev) => ({
        ...prev,
        roleId: role.id,
      }))
    } else if (!isOpen) {
      setUsers([])
      setFilter({ ...defaultUserRoleCursorFilterDto })
      setSelectedKeys(new Set([]))
    }
  }, [role, isOpen])

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

                <ScrollShadow
                  ref={parentRef}
                  className={clsx(
                    'h-96 relative',
                    isFetching && !isRowLoading ? 'overflow-hidden' : '',
                  )}
                >
                  {isFetching && !isRowLoading && (
                    <div className="flex justify-center items-center z-50 absolute top-0 left-0 w-full h-full opacity-50 bg-background">
                      <Spinner />
                    </div>
                  )}
                  <ListBox
                    className="w-full p-2 border border-default rounded-md relative"
                    aria-label="Gán thành viên"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={(keys) =>
                      setSelectedKeys(keys as Selection)
                    }
                    style={{ height: `${rowVirtualizer.getTotalSize() + 8}px` }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const item = users[virtualItem.index]
                      if (!item) return null
                      return (
                        <ListBox.Item
                          key={item.id}
                          id={item.id}
                          textValue={item?.fullName}
                          className={clsx('my-1 absolute top-0 left-0 w-full')}
                          style={{
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <Avatar.Image alt="avatar" src={item?.avatar} />
                              <Avatar.Fallback>
                                {StringHelper.getFirstLetterUpper(
                                  item?.fullName,
                                )}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {item?.fullName}
                              </span>
                              <span className="text-xs text-default-500">
                                {item?.userName}
                              </span>
                            </div>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )
                    })}
                  </ListBox>
                  {isRowLoading && (
                    <div className="flex justify-center items-center w-full">
                      <Spinner />
                    </div>
                  )}
                </ScrollShadow>
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
