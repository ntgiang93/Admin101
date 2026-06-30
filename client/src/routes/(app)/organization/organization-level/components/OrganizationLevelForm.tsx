import {Button, Card, Checkbox, FieldError, Form, Input, Label, NumberField, Spinner, TextField,} from '@heroui/react'
import {useEffect, useState} from 'react'
import {useTranslation} from "react-i18next";
import {FormSkeleton} from "@/components/ui/loading/FormSkeleton.tsx";
import {OrganizationLevelHook} from "@/hooks/orgazination/organization-level.ts";
import {defaultOrganizationLevelDto, type SaveOrganizationLevelDto} from "@/types/sys/OrganizationLevel.ts";

interface MenuFromProps {
    id: number
    onRefresh: () => void
    onResetSelected: () => void
}

export default function OrganizationLevelForm(props: MenuFromProps) {
    const {id, onRefresh, onResetSelected} = props
    const [form, setForm] = useState<SaveOrganizationLevelDto>({...defaultOrganizationLevelDto})
    const {data, isFetching} = OrganizationLevelHook.useGet(id)
    const {mutateAsync: save, isPending} = OrganizationLevelHook.useSave()
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

    useEffect(() => {
        if (data && id > 0) {
            setForm({...data})
        }
        else {
            setForm({...defaultOrganizationLevelDto,})
        }
    }, [data, id])

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
                        id="organizationLevelForm"
                        onSubmit={onSubmit}
                        className={'flex flex-col gap-3 p-0.5'}
                    >
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
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>{t('name')}</Label>
                            <Input autoFocus placeholder={t('placeholder_input', {field: t('name')})} tabIndex={1}/>
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="w-full"
                            name="code"
                            isRequired
                            variant={'secondary'}
                            value={form.code}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, code: value}))
                            }}
                            validate={(value) => {
                                return value === '' || !value
                                    ? t('msg.required_field')
                                    : null
                            }}
                        >
                            <Label>{t('code')}</Label>
                            <Input autoFocus placeholder={t('placeholder_input', {field: t('code')})} tabIndex={1}/>
                            <FieldError/>
                        </TextField>
                        <TextField
                            className="w-full"
                            name="description"
                            variant={'secondary'}
                            value={form.description}
                            onChange={(value) => {
                                setForm((prev) => ({...prev, description: value}))
                            }}
                        >
                            <Label>{t('description')}</Label>
                            <Input placeholder={t('placeholder_input', {field: t('description')})} tabIndex={2}/>
                            <FieldError/>
                        </TextField>
                        <div className="grid grid-cols-2 gap-8">
                            <NumberField
                                minValue={0}
                                step={1}
                                isRequired={true}
                                variant={'secondary'}
                                value={form.rank}
                                onChange={(value) =>
                                    setForm((prev) => ({...prev, rank: value}))
                                }
                            >
                                <Label>{t('rank')}</Label>
                                <NumberField.Group>
                                    <NumberField.DecrementButton/>
                                    <NumberField.Input/>
                                    <NumberField.IncrementButton/>
                                </NumberField.Group>
                                <FieldError>{t('msg.required_field')}</FieldError>
                            </NumberField>
                            <Checkbox className="mt-8" isSelected={form.isActive} variant={'secondary'}
                                      onChange={(value) => setForm((prev) => ({...prev, isActive: value}))
                                      }>
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator/>
                                    </Checkbox.Control>
                                    {t('active')}
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
                <Button type="submit" form="organizationLevelForm" isPending={isPending} isDisabled={isFetching}>
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
