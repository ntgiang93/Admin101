import {MenuHook} from '@/hooks/sys/menu'
import {
    defaultSaveMenuDto,
    type MenuItem,
    type SaveMenuDto,
} from '@/types/sys/Menu'
import {
    Button, Card, Checkbox,
    FieldError,
    Form,
    Input,
    Label,
    NumberField,
    Spinner,
    TextField,
} from '@heroui/react'
import {useEffect, useState} from 'react'
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
            if (form.id == 0) {
                onResetSelected()
            }
            onRefresh()
        }
    }
    
    const validateSysmodule = (value: string) => {
        if (!form.isGroup && (!value || value === '')) {
            return t('msg.required_field')
        }
        return null
    }

    useEffect(() => {
        if (data && id > 0) {
            setForm({
                ...data,
                sysmodule: data.sysmodule || '',
            })
        }
        else {
            setForm({
                ...defaultSaveMenuDto,
                parentId: parent?.id || 0,
                path: parent ? parent.path + '/' : '/',
            })
        }
    }, [data, id, parent])

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
                            label={'Menu ' + t('parent')}
                            values={form.parentId || 0}
                            onChange={(values) => {
                                setForm((prev) => ({
                                    ...prev,
                                    parentId: values as number,
                                }))
                            }

                            }
                            isRequired={false}
                            selectionMode={'single'}
                        />
                        <TextField
                            className="w-full"
                            name="name"
                            isRequired
                            variant={'secondary'}
                            value={form.viName}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, viName: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>{t('vi_name')}</Label>
                            <Input autoFocus placeholder={t('placeholder_input', {field: t('vi_name')})} tabIndex={1}/>
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="w-full"
                            name="name"
                            isRequired
                            variant={'secondary'}
                            value={form.enName}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, enName: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>{t('en_name')}</Label>
                            <Input autoFocus placeholder={t('placeholder_input', {field: t('en_name')})} tabIndex={1}/>
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="w-full"
                            name="url"
                            isRequired
                            variant={'secondary'}
                            value={form.path}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, path: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>{t('path')}</Label>
                            <Input placeholder={t('placeholder_input', {field: t('path')})} tabIndex={2}/>
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
                            isRequired={!form.isGroup}
                            value={form.sysmodule}
                            onChange={(value) =>
                                setForm((prev) => ({...prev, sysmodule: value}))
                            }
                            validate={validateSysmodule}
                        />
                        <div className="grid grid-cols-2 gap-8">
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
                            <Checkbox className="mt-8" isSelected={form.isGroup} variant={'secondary'}
                                      onChange={(value) => setForm((prev) => ({...prev, isGroup: value}))
                            }>
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator/>
                                    </Checkbox.Control>
                                    {t('menu_group')}
                                </Checkbox.Content>
                            </Checkbox>
                        </div>

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
