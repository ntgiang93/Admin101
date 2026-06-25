import {RoleHook} from '@/hooks/sys/role'
import {type AddRoleMemberDto, type RoleDto} from '@/types/sys/Role'
import {Button, Card, Spinner, Tooltip} from '@heroui/react'
import {useRef, useState} from 'react'
import {useTranslation} from "react-i18next";
import RoleMemberList, {type RoleMemberListRef} from "@/routes/(app)/sys/role/components/RoleMemberList.tsx";
import NotRoleMemberList, {type NotRoleMemberListRef} from "@/routes/(app)/sys/role/components/NotRoleMemberList.tsx";
import {HugeiconsIcon} from "@hugeicons/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@hugeicons/core-free-icons";

interface IRoleMemberProps {
    role: RoleDto
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export default function RoleMember(props: IRoleMemberProps) {
    const {role} = props
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set<string>())
    const [removedUsers, setRemovedUsers] = useState<Set<string>>(new Set<string>())
    const cardRef = useRef<HTMLDivElement>(null)
    const userInRoleRef = useRef<RoleMemberListRef>(null);
    const userNotInRoleRef = useRef<NotRoleMemberListRef>(null);
    const {mutateAsync: addMembers, isPending: isPendingAdd} = RoleHook.useAddMember()
    const {mutateAsync: removeMembers, isPending: isPendingRemove} = RoleHook.useRemoveMember(role.id)
    const {t} = useTranslation()

    const handleSelectUser = (userId: string, isSelect: boolean) => {
        setSelectedUsers((prev) => {
            const next = new Set(prev)
            if (isSelect) next.add(userId)
            else next.delete(userId)
            return next
        })
    }

    const handleSelectRemovedUser = (userId: string, isSelect: boolean) => {
        setRemovedUsers((prev) => {
            const next = new Set(prev)
            if (isSelect) next.add(userId)
            else next.delete(userId)
            return next
        })
    }
    
    const handleRefresh = () => {
        setSelectedUsers(new Set<string>())
        setRemovedUsers(new Set<string>())
        userInRoleRef.current?.refresh()
        userNotInRoleRef.current?.refresh()
    }

    const handleRemove = async () => {
        if (removedUsers.size === 0 || !role) return
        const userIds = Array.from(removedUsers) as string[]
        const success = await removeMembers(userIds)
        if (success) {
            handleRefresh()
        }
    }

    const handleAdd = async () => {
        if (!role) return
        // prepare body
        const body: AddRoleMemberDto = {
            roleId: role.id,
            userIds: Array.from(selectedUsers) as string[],
        }
        //excute add members
        const success = await addMembers(body)
        if (success) {
            handleRefresh()
        }
    }

    return (
        <Card variant={'transparent'} ref={cardRef} className="w-full h-full p-0">
            <Card.Content className="h-full w-full grid grid-cols-7 gap-2">
                <RoleMemberList ref={userInRoleRef} role={role} selectedUsers={removedUsers} onSelectedChange={handleSelectRemovedUser}/>
                <div className="flex flex-col items-center justify-center gap-4">
                    <Tooltip delay={0}>
                        <Button isIconOnly variant="primary"
                                isDisabled={selectedUsers.size === 0} onPress={handleAdd}
                                isPending={isPendingAdd}
                        >
                            {({isPending}) => (
                                <>
                                    {isPending ? <Spinner color="current" size="sm"/> :
                                        <HugeiconsIcon icon={ChevronLeftIcon}/>}
                                </>
                            )}
                        </Button>
                        <Tooltip.Content>
                            <p>{t('assign_user_to_role')}</p>
                        </Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                        <Button isIconOnly variant="danger" isDisabled={removedUsers.size === 0} onPress={handleRemove}
                                isPending={isPendingRemove}>
                            {({isPending}) => (
                                <>
                                    {isPending ? <Spinner color="current" size="sm"/> :
                                        <HugeiconsIcon icon={ChevronRightIcon}/>}
                                </>
                            )}
                        </Button>
                        <Tooltip.Content className="bg-danger-soft" placement={'bottom'}>
                            <p>{t('remove_user_from_role')}</p>
                        </Tooltip.Content>
                    </Tooltip>
                </div>
                <NotRoleMemberList  ref={userNotInRoleRef} role={role} selectedUsers={selectedUsers} onSelectedChange={handleSelectUser}/>
            </Card.Content>
        </Card>
    )
}
