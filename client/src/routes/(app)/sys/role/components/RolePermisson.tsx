import {RoleHook} from '@/hooks/sys/role'
import {SysCategoryHook} from '@/hooks/sys/sysCategories'
import {EPermission} from '@/types/base/Permission'
import {type RoleDto, type RolePermissionDto} from '@/types/sys/Role'
import {Button, Card, Label, ScrollShadow, Spinner} from '@heroui/react'
import {useEffect, useRef, useState} from 'react'
import {SearchInput} from "@/components/ui/input/SearchInput.tsx";
import PermissionCheckbox from "@/routes/(app)/sys/role/components/PermissionCheckBox.tsx";
import {useVirtualizer} from "@tanstack/react-virtual";
import {useTranslation} from "react-i18next";

interface IRolePermisionProps {
    role: RoleDto
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

interface PermissionTable {
    id: string
    moduleName: string
}

export default function RolePermisson(props: IRolePermisionProps) {
    const {role, isOpen, onOpenChange} = props
    const [searchValue, setSearchValue] = useState<string>('')
    const [tableData, setTableData] = useState<PermissionTable[]>([])
    const [form, setForm] = useState<RolePermissionDto[]>([])
    const {data: rolePermissions, isLoading} = RoleHook.useGetPermission(
        isOpen ? role.id : 0,
    )
    const {data: sysmodules, isLoading: loadingModule} = SysCategoryHook.useGetSysModule()
    const {mutateAsync: save, isPending} = RoleHook.useAssignPermission(role.id)
    const {data: permissions, isLoading: loadingPermssion} = SysCategoryHook.useGetPermission()
    const cardRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()

    const checkedPermisson = (sysmodule: string, permission: EPermission) => {
        return form.some(
            (rp) =>
                rp.sysModule === sysmodule &&
                (rp.permission & permission) === permission,
        )
    }

    const handleCheckedChange = (
        sysmodule: string,
        permission: EPermission,
        checked: boolean,
    ) => {
        if (!role) return
        if (!checked) {
            const newForm = form.filter(
                (rp) =>
                    rp.sysModule !== sysmodule ||
                    (rp.permission & permission) !== permission,
            )
            setForm([...newForm])
        } else {
            if (permission === EPermission.All) {
                const newForm = form.filter((rp) => rp.sysModule !== sysmodule)
                setForm([
                    ...newForm,
                    {sysModule: sysmodule, permission: permission, roleId: role.id},
                ])
            } else {
                const newForm = [
                    ...form,
                    {sysModule: sysmodule, permission: permission, roleId: role.id},
                ]
                setForm([...newForm])
            }
        }
    }

    const onSubmit = async () => {
        const success = await save(form)
        if (success) {
            onOpenChange(false)
        }
    }
    
    // The virtualizer
    const rowVirtualizer = useVirtualizer({
        count: tableData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        
    })
    
    const handleBoxHeight = () => {
        let height = 276
        if (cardRef.current) {
            const cardHeight = cardRef.current.clientHeight
            height = cardHeight - 96;
        }
        return height
    }
    
    const boxHeight = handleBoxHeight()

    useEffect(() => {
        let rawData: any[] = []
        if (!searchValue || searchValue.trim() === '') {
            rawData = [...(sysmodules || [])]
        } else
            rawData = (sysmodules || []).filter((m) =>
                m.label.toLowerCase().includes(searchValue.toLowerCase()),
            )
        setTableData(
            rawData.map((m) => {
                return {id: m.value, moduleName: m.label}
            }),
        )
    }, [sysmodules, searchValue])

    useEffect(() => {
        if (rolePermissions) {
            setForm([...rolePermissions])
        }
    }, [role, rolePermissions])

    return (
        <Card variant={'transparent'} ref={cardRef} className="h-full p-0">
            <Card.Header>
                <SearchInput onValueChange={setSearchValue} value={searchValue} className="w-64"/>
            </Card.Header>
            <Card.Content className="h-full flex flex-col">
                <ScrollShadow
                    ref={parentRef}
                    aria-label="Virtualized list"
                    className="w-full overflow-auto"
                    style={{maxHeight: boxHeight}}
                    size={20}
                >
                    {loadingModule || loadingPermssion || isLoading ? (
                        <Spinner className="m-auto" size="lg"/>
                    )
                    : (
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {/* Only the visible items in the virtualizer, manually positioned to be in view */}
                                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                    const row = tableData[virtualItem.index]
                                    return (
                                        <div
                                            className="absolute w-full top-0 left-0 flex flex-col"
                                            key={virtualItem.key}
                                            style={{
                                                height: `${virtualItem.size}px`,
                                                transform: `translateY(${virtualItem.start}px)`,
                                            }}
                                        >
                                            <Label className="text-lg my-2">{row.moduleName}</Label>
                                            <div className="flex gap-8 w-full">
                                                {permissions?.map((p => {
                                                    return (
                                                        <PermissionCheckbox
                                                            key={`${row.id}-${p.value}`}
                                                            moduleKey={row.id}
                                                            permission={p}
                                                            checked={checkedPermisson(
                                                                row.id,
                                                                p.value as EPermission,
                                                            )}
                                                            onChange={handleCheckedChange}
                                                        />
                                                    )
                                                }))}
                                            </div>
                                        </div>
                                    )})}
                            </div>
                        )
                    }
                </ScrollShadow>
            </Card.Content>
            <Card.Footer className="w-full flex justify-end gap-2">
                <Button variant="tertiary" slot="close">
                    Đóng
                </Button>
                <Button onPress={onSubmit} isPending={isPending}>
                    {({isPending}) => {
                        if (isPending)
                            return (
                                <Spinner/>
                            )
                        else return <span>{t('save')}</span>
                    }}
                </Button>
            </Card.Footer>
        </Card>
    )
}
