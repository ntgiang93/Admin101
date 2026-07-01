import {SearchInput} from '@/components/ui/input/SearchInput'
import {useAuth} from '@/components/ui/layout/AuthProvider.tsx'
import {RoleHook} from '@/hooks/sys/role'
import {StringHelper} from '@/libs/StringHelper.ts'
import {EPermission} from '@/types/base/Permission'
import {SysModule} from '@/types/constant/SysModule.ts'
import {defaultRoleDto, type RoleDto} from '@/types/sys/Role'
import {Button, Card, ListBox, Separator, Spinner, Tabs, Tooltip} from '@heroui/react'
import {Add01Icon, Cancel01Icon, Delete02Icon, Refresh, SaveIcon, ShieldCheck,} from '@hugeicons/core-free-icons'
import {HugeiconsIcon} from '@hugeicons/react'
import {createFileRoute} from '@tanstack/react-router'
import {useState} from 'react'
import EmptyState from "@/assets/empty-state.png";
import ConfirmDeleteDialog from "@/components/ui/dialog/ConfirmDeleteDialog.tsx";
import {useTranslation} from "react-i18next";
import RolePermisson from "@/routes/(app)/sys/role/components/RolePermisson.tsx";
import {useMutationState} from "@tanstack/react-query";
import RoleMember from "@/routes/(app)/sys/role/components/RoleMember.tsx";
import RoleForm from "@/routes/(app)/sys/role/components/RoleForm.tsx";
import clsx from "clsx";

export const Route = createFileRoute('/(app)/sys/role/')({
    component: Roles,
})

function Roles() {
    const {data: roles, refetch} = RoleHook.useGetAll()
    const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>(
        undefined,
    )
    const [searchValue, setSearchValue] = useState<string>('')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const {hasPermission} = useAuth()
    const canCreate = hasPermission(SysModule.Roles, EPermission.Create)
    const canEdit = hasPermission(SysModule.Roles, EPermission.Edit)
    const canDelete = hasPermission(SysModule.Roles, EPermission.Delete)
    const {mutateAsync: del, isPending} = RoleHook.useDelete(
        selectedRole?.id || 0,
    )
    const {t} = useTranslation()
    const isSaving =
        useMutationState({
            filters: {
                mutationKey: ['role', 'useSave'],
                status: 'pending',
            },
        }).length > 0;

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

    const data = handleFilter(searchValue)

    const handleDelete = async () => {
        const success = await del()
        if (success) {
            await refetch()
            setSelectedRole(undefined)
        }
        setConfirmOpen(false)
    }

/*    useEffect(() => {
        if (!detailOpen && !assignUserOpen && !permissionOpen) {
            setSelectedRole(undefined)
        }
    }, [detailOpen, assignUserOpen, permissionOpen])*/

    return (
        <Card variant="transparent" className="h-full">
            <Card.Header className="flex-row justify-between w-full">
                <Card.Title className="text-2xl text-accent w-fit">{t('role_page_title')}</Card.Title>
                <div className="flex">
                    <Button hidden={!canCreate} onPress={() => setSelectedRole({...defaultRoleDto})}>
                        <HugeiconsIcon icon={Add01Icon} stroke={'3'}/>
                        {t('create')}
                    </Button>
                </div>
            </Card.Header>
            <Card.Content className="grid grid-cols-3 gap-4 h-full">
                <Card className="col-span-1 h-full flex flex-col">
                    <Card.Header>
                        <div className="flex justify-between items-center my-1">
                            <SearchInput
                                value={searchValue}
                                onValueChange={(value) =>
                                    setSearchValue(value)
                                }
                            />
                            <div className="flex gap-2">
                                <Tooltip delay={0}>
                                    <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                                        <HugeiconsIcon icon={Refresh}/>
                                    </Button>
                                    <Tooltip.Content>
                                        <p>{t('refetch')}</p>
                                    </Tooltip.Content>
                                </Tooltip>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Content className="flex-1 min-h-0">
                        <ListBox aria-label="roles" className="w-full" selectionMode="single">
                            {data.map((role) => {
                                const isSelected = selectedRole?.id === role.id
                                return (
                                <ListBox.Item
                                    key={role.id}
                                    textValue={role.id.toString()}
                                    onPress={() => setSelectedRole(role)}
                                    className={clsx("flex items-center justify-between w-full gap-4 px-4", isSelected ? "bg-accent" : "")}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <h2 className={clsx("text-lg font-semibold", isSelected ? "text-accent-foreground": "")}>{role.name}</h2>
                                        <p className={clsx("text-sm", isSelected ? "text-accent-foreground" : "text-muted-foreground")}>{role.description}</p>
                                    </div>
                                    {role.isProtected && (
                                        <HugeiconsIcon className={clsx(isSelected ? "text-accent-foreground" : "text-accent")} icon={ShieldCheck} size={24}/>)}
                                </ListBox.Item>
                            )})}
                        </ListBox>
                    </Card.Content>
                    <Card.Footer/>
                </Card>
                {(!selectedRole) && (
                    <Card className="col-span-2">
                        <Card.Content>
                            <div className="flex items-center justify-center h-full w-full">
                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                    <img src={EmptyState} alt={'empty'}/>
                                    <h2 className='text-xl font-semibold'>{t('empty_card_title')}</h2>
                                    <p>{t('empty_card_desc')}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                )}
                {selectedRole && (
                    <Card className={"col-span-2 h-full"}>
                        <Card.Header className="flex flex-row w-full justify-between">
                            <div>
                                <Card.Title
                                    className="text-xl font-semibold">{(selectedRole.id > 0 ? t('edit') : t('create')) + ' ' + t('role')}</Card.Title>
                                <p className="text-sm text-muted">{t('protected_role_msg')}</p>
                            </div>
                            <div className="flex gap-2">
                                {selectedRole.id > 0 && canDelete && (
                                    <Tooltip delay={0}>
                                        <Button variant="danger-soft" isIconOnly size={'sm'}
                                                onPress={() => setConfirmOpen(true)} isDisabled={selectedRole.isProtected || isSaving}>
                                            <HugeiconsIcon icon={Delete02Icon}/>
                                        </Button>
                                        <Tooltip.Content>
                                            <p>{t('delete')}</p>
                                        </Tooltip.Content>
                                    </Tooltip>
                                )}
                                <Tooltip delay={0}>
                                    <Button hidden={!canCreate && !canEdit} variant="primary" type={'submit'} form="roleForm" isIconOnly size={'sm'}
                                            isDisabled={selectedRole.isProtected || isSaving} isPending={isSaving}>
                                        {({isPending}) => {
                                            if (isPending)
                                                return (
                                                    <>
                                                        <Spinner/>
                                                    </>
                                                )
                                            else return <HugeiconsIcon icon={SaveIcon}/>
                                        }}
                                    </Button>
                                    <Tooltip.Content>
                                        <p>{t('save')}</p>
                                    </Tooltip.Content>
                                </Tooltip>
                                <Tooltip delay={0}>
                                    <Button variant="ghost" isIconOnly size={'sm'}
                                            onPress={() => setSelectedRole(undefined)}>
                                        <HugeiconsIcon icon={Cancel01Icon}/>
                                    </Button>
                                    <Tooltip.Content>
                                        <p>{t('cancel')}</p>
                                    </Tooltip.Content>
                                </Tooltip>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <RoleForm id={selectedRole?.id || 0} readonly={selectedRole.isProtected} onRefresh={refetch}
                                      onResetSelected={() => setSelectedRole(undefined)}/>
                            <Separator className="my-4"/>
                            <Tabs className="w-full h-full">
                                <Tabs.ListContainer>
                                    <Tabs.List aria-label="Options" className="max-w-md">
                                        <Tabs.Tab id="permission">
                                            {t('permission_page_title')}
                                            <Tabs.Indicator/>
                                        </Tabs.Tab>
                                        <Tabs.Tab id="member">
                                            {t('member_manage')}
                                            <Tabs.Indicator/>
                                        </Tabs.Tab>
                                    </Tabs.List>
                                </Tabs.ListContainer>
                                <Tabs.Panel className="w-full h-full" id="permission">
                                    <RolePermisson role={selectedRole} isOpen={true} onOpenChange={() => {}}/>
                                </Tabs.Panel>
                                <Tabs.Panel className="w-full h-full" id="member">
                                    <RoleMember role={selectedRole} isOpen={true} onOpenChange={() => {}}/>
                                </Tabs.Panel>
                            </Tabs>
                        </Card.Content>
                    </Card>
                )}
            </Card.Content>
            <ConfirmDeleteDialog isOpen={confirmOpen} onOpenChange={setConfirmOpen} isPending={isPending}
                                 onDelete={handleDelete} itemName={selectedRole?.name}/>
        </Card>
    )
}
