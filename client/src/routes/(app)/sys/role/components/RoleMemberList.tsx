import {SearchInput} from '@/components/ui/input/SearchInput'
import {RoleHook} from '@/hooks/sys/role'
import {StringHelper} from '@/libs/StringHelper.ts'
import {defaultUserRoleCursorFilterDto, type RoleDto, type UserRoleCursorFilterDto,} from '@/types/sys/Role'
import {type UserSelectDto} from '@/types/sys/User'
import {Avatar, Card, Description, Label, ScrollShadow, Spinner,} from '@heroui/react'
import {useVirtualizer} from '@tanstack/react-virtual'
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import clsx from "clsx";
import {useTranslation} from "react-i18next";
import {HugeiconsIcon} from "@hugeicons/react";
import {Cancel01Icon, UserGroup03Icon} from "@hugeicons/core-free-icons";
import {motion} from "motion/react"

export interface RoleMemberListRef {
    refresh: () => void;
}

interface RoleMemberListProps {
    role?: RoleDto
    selectedUsers: Set<string>
    onSelectedChange: (id: string, isSelected: boolean) => void
}

const RoleMemberList = forwardRef<RoleMemberListRef, RoleMemberListProps>((props: RoleMemberListProps, ref) => {
    const {role, selectedUsers, onSelectedChange} = props
    const [filter, setFilter] = useState<UserRoleCursorFilterDto>({
        ...defaultUserRoleCursorFilterDto,
    })
    const {data, isFetching, refetch} = RoleHook.useGetMembers(filter)
    const [users, setUsers] = useState<UserSelectDto[]>([])
    const parentRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const cardHeaderRef = useRef<HTMLDivElement>(null)
    const {t} = useTranslation()
    const handleBoxHeight = () => {
        let height = 276
        if (cardRef.current) {
            const cardHeight = cardRef.current.clientHeight
            const headerHeight = cardHeaderRef.current?.clientHeight || 64
            height = cardHeight - headerHeight - 16;
        }
        return height
    }

    const boxHeight = handleBoxHeight()

    // Use virtualized rendering so the list stays performant even with many users.
    const rowVirtualizer = useVirtualizer({
        count: data?.hasMore ? users.length + 1 : users.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 52,
    })

    const handleDataLoad = (data: UserSelectDto[]) => {
        if (!filter.cursor) {
            setUsers([...data])
        } else {
            setUsers((prev) => [...prev, ...data])
        }
    }

    useImperativeHandle(ref, () => ({
        async refresh(){
            await refetch()
        }
    }));

    useEffect(() => {
        if (data) {
            handleDataLoad(data.items)
        }
    }, [data])

    useEffect(() => {
        setFilter((prev) => ({...prev, roleId: role ? role.id : prev.roleId}))
    }, [role])

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
        }
    }, [
        data?.hasMore,
        data?.nextCursor,
        users.length,
        isFetching,
        rowVirtualizer.getVirtualItems(),
    ])

    return (
        <Card ref={cardRef} variant={'transparent'} className="col-span-3 p-0 h-full">
            <Card.Header ref={cardHeaderRef}>
                <Card.Title className="flex gap-1 items-center"><HugeiconsIcon icon={UserGroup03Icon} size={20}/>{t('in_role')}</Card.Title>
                <SearchInput
                    value={filter.searchValue}
                    onValueChange={(value) => {
                        setFilter((prev) => ({
                            ...prev,
                            cursor: null,
                            searchValue: value,
                        }))
                    }}
                />
            </Card.Header>
            <Card.Content>
                <ScrollShadow
                    ref={parentRef}
                    className=""
                    style={{
                        height: boxHeight,
                        width: `100%`,
                        overflow: 'auto',
                    }}
                >
                    {(!users || users.length == 0) && (
                        <div className="flex h-full justify-center items-center p-8">
                            <p className="text-center">{t('no_member')}</p>
                        </div>
                    )}
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const isLoaderRow = virtualRow.index > users.length - 1
                            const user = users[virtualRow.index]
                            const isSelected = selectedUsers.has(user?.id || '')
                            return (
                                <div
                                    key={virtualRow.index}
                                    className="absolute top-0 left-0 w-full flex justify-between"
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    onClick={() => {
                                        onSelectedChange(user?.id || '', !isSelected)
                                    }}
                                >
                                    {isLoaderRow
                                        ? data?.hasMore
                                            ? <Spinner></Spinner>
                                            : <></>
                                        : (<div className={clsx('flex items-center justify-between gap-4 p-2 my-1 w-full',
                                                'cursor-pointer p-1 rounded-lg',
                                                `${isSelected ? 'bg-danger-soft' : 'has-[*:hover]:bg-default-hover hover:bg-default-hover'}`)}>
                                                <div className="flex items-center justify-start gap-4">
                                                    <Avatar size="sm" color={isSelected ? 'danger' : 'default'}>
                                                        <Avatar.Image alt="avatar" src={user?.avatar}/>
                                                        <Avatar.Fallback>
                                                            {StringHelper.getFirstLetterUpper(user?.fullName)}
                                                        </Avatar.Fallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <Label>{user.fullName}</Label>
                                                        <Description>{user.userName}</Description>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{
                                                            duration: 0.4,
                                                            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                                                        }}
                                                    >
                                                        <HugeiconsIcon className="text-danger" icon={Cancel01Icon} size={20} />
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            )
                        })}
                    </div>
                </ScrollShadow>
            </Card.Content>
        </Card>
    )
});

export default RoleMemberList
