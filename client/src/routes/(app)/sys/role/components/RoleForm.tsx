import {FieldError, Form, Input, Label, TextField,} from '@heroui/react'
import {useEffect, useState} from 'react'
import {MSG_LIST} from '@/types/constant/MessageList.ts'
import {useTranslation} from "react-i18next";
import {FormSkeleton} from "@/components/ui/loading/FormSkeleton.tsx";
import {defaultRoleDto, type RoleDto} from "@/types/sys/Role.ts";
import {RoleHook} from "@/hooks/sys/role.ts";

interface RoleFromProps {
    id: number,
    readonly? : boolean,
    onRefresh: () => void
    onResetSelected: () => void
}

export default function RoleForm(props: RoleFromProps) {
    const {id, onRefresh, onResetSelected, readonly} = props
    const [form, setForm] = useState<RoleDto>({...defaultRoleDto})
    const {data, isFetching} = RoleHook.useGet(id)
    const {mutateAsync: save} = RoleHook.useSave()
    const {t} = useTranslation()

    const onSubmit = async (e: any) => {
        e.preventDefault()
        const response = await save(form)
        if (response && response.success) {
            if (form.id == 0) {
                onResetSelected()
            }
            onRefresh()
        }
    }

    const handleRoleCode = (value: string) => {
        const roleCode = value.trim().toUpperCase().replace(/\s+/g, '_')
        setForm((prev) => ({...prev, code: roleCode}))
    }

    useEffect(() => {
        if (data) {
            setForm({...data})
        }
    }, [data])

    return (
        <div className='flex flex-col gap-4'>
            {isFetching ? (
                <FormSkeleton row={2} col={2}/>
            ) : (
                <Form
                    id="roleForm"
                    onSubmit={onSubmit}
                    className={'flex flex-col gap-3 p-0.5'}
                >
                    <div className={'grid grid-cols-2 gap-8'}>
                        <TextField
                            className="col-span-1"
                            name="code"
                            isRequired
                            isReadOnly={readonly}
                            variant={'secondary'}
                            value={form.code}
                            onChange={(value) => handleRoleCode(value)}
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>Mã vai trò</Label>
                            <Input
                                placeholder="Nhập mã vai trò"
                                autoFocus
                                tabIndex={1}
                                disabled={id > 0}
                            />
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="col-span-1"
                            name="name"
                            isRequired
                            isReadOnly={readonly}
                            variant={'secondary'}
                            value={form.name}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, name: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? MSG_LIST.REQUIRED_FIELD
                                    : null
                            }}
                        >
                            <Label>Tên vai trò</Label>
                            <Input placeholder="Nhập tên vai trò" tabIndex={2}/>
                            <FieldError/>
                        </TextField>
                    </div>
                    <TextField
                        className="w-full"
                        name="description"
                        isReadOnly={readonly}
                        variant={'secondary'}
                        value={form.description || ''}
                        onChange={(value) => {
                            setForm((prev) => ({...prev, description: value}))
                        }}
                    >
                        <Label>Mô tả</Label>
                        <Input placeholder="Nhập mô tả" tabIndex={3}/>
                        <FieldError/>
                    </TextField>
                </Form>
            )}
{/*            <div className={'w-full flex justify-end gap-4'}>
                <Button type="submit" form="roleForm" isPending={isPending} isDisabled={isFetching}>
                    {({isPending}) => {
                        if (isPending)
                            return (
                                <>
                                    <Spinner/>
                                    <span>Đang lưu</span>
                                </>
                            )
                        else return <span>Lưu</span>
                    }}
                </Button>
            </div>*/}
        </div>
    )
}
