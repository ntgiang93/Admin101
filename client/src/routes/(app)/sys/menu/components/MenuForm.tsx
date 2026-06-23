import {MenuHook} from '@/hooks/sys/menu'
import {
    defaultSaveMenuDto,
    type MenuItem,
    type SaveMenuDto,
} from '@/types/sys/Menu'
import {
    Button, Card,
    FieldError,
    Form,
    Input,
    Label,
    NumberField,
    Spinner,
    TextField,
} from '@heroui/react'
import {useEffect, useState} from 'react'
import {MSG_LIST} from '@/types/constant/MessageList.ts'
import SysModuleSelect from '@/components/shared/app/select/SysModuleSelect.tsx'
import MenuSelect from '@/components/shared/app/select/MenuSelect.tsx'
import {IconSelect} from '@/components/ui/icon/IconSelect.tsx'
import {useTranslation} from "react-i18next";
import {FormSkeleton} from "@/components/ui/loading/FormSkeleton.tsx";

interface MenuFromProps {
    parent: MenuItem | undefined
    id: number
    onRefresh: () => void
    onResetSelected: () => void
}

export default function MenuForm(props: MenuFromProps) {
    const {id, onRefresh, parent, onResetSelected} = props
    const [form, setForm] = useState<SaveMenuDto>({...defaultSaveMenuDto})
    const {data, isFetching} = MenuHook.useGet(id)
    const {mutateAsync: save, isPending} = MenuHook.useSave()
    const {t} = useTranslation()

    const onSubmit = async (e: any) => {
        e.preventDefault()
        const response = await save(form)
        if (response && response.success) {
            if(form.id == 0) {
                onResetSelected()
            }
            onRefresh()
        }
    }

    useEffect(() => {
        if (!data) {
            setForm({
                ...defaultSaveMenuDto,
                parentId: parent?.id || 0,
                url: parent ? parent.url + '/' : '/',
            })
        }
    }, [parent?.id])

    useEffect(() => {
        if (data) {
            setForm({
                ...data,
                sysmodule: data.sysmodule || '',
            })
        }
    }, [data])

    return (
        <Card className="col-span-1 h-full">
            <Card.Header>
                <Card.Title className="text-xl">{(id > 0 ? t('edit') : t('create')) + ' Menu'}</Card.Title>
            </Card.Header>
            <Card.Content>
                {isFetching ? (
                    <FormSkeleton row={6}/>
                ) : (
                    <Form
                        id="menuForm"
                        onSubmit={onSubmit}
                        className={'flex flex-col gap-3 p-0.5'}
                    >
                        <MenuSelect
                            label={'Menu ' +  t('parent')}
                            values={form.parentId || 0}
                            onChange={(values) =>
                                setForm((prev) => ({
                                    ...prev,
                                    parentId: values as number,
                                }))
                            }
                            isRequired={false}
                            selectionMode={'single'}
                        />
                        <TextField
                            className="w-full"
                            name="name"
                            isRequired
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
                            <Label>{t('name')}</Label>
                            <Input autoFocus placeholder={t('placeholder_input',{field: t('name')})} tabIndex={1}/>
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="w-full"
                            name="url"
                            isRequired
                            variant={'secondary'}
                            value={form.url}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, url: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? MSG_LIST.REQUIRED_FIELD
                                    : null
                            }}
                        >
                            <Label>{t('path')}</Label>
                            <Input placeholder={t('placeholder_input',{field: t('path')})} tabIndex={2}/>
                            <FieldError/>
                        </TextField>
                        <IconSelect
                            label="Icon"
                            value={form.icon}
                            onChange={(value) =>
                                setForm((prev) => ({...prev, icon: value}))
                            }
                        />
                        <SysModuleSelect
                            isRequired={true}
                            value={form.sysmodule}
                            onChange={(value) =>
                                setForm((prev) => ({...prev, sysmodule: value}))
                            }
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        />
                        <NumberField
                            minValue={0}
                            step={1}
                            variant={'secondary'}
                            value={form.displayOrder}
                            onChange={(value) =>
                                setForm((prev) => ({...prev, displayOrder: value}))
                            }
                        >
                            <Label>{t('display_order')}</Label>
                            <NumberField.Group>
                                <NumberField.DecrementButton/>
                                <NumberField.Input/>
                                <NumberField.IncrementButton/>
                            </NumberField.Group>
                            <FieldError/>
                        </NumberField>
                    </Form>
                )}
            </Card.Content>
            <Card.Footer className="flex justify-end gap-2">
                <Button variant="tertiary" slot="close" isDisabled={isPending || isFetching} onPress={onResetSelected}>
                    Hủy bỏ
                </Button>
                <Button type="submit" form="menuForm" isPending={isPending} isDisabled={isFetching}>
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
            </Card.Footer>
        </Card>
    )
}
