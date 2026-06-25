import {SysCategoryHook} from '@/hooks/sys/sysCategories'
import {
    ComboBox,
    FieldError,
    Input,
    Label,
    ListBox,
    Spinner,
} from '@heroui/react'
import {useMemo} from 'react'
import {MSG_LIST} from '@/types/constant/MessageList.ts'
import {useTranslation} from "react-i18next";

interface ISysModuleSelectProps {
    value: string
    onChange: (value: string) => void
    multiple?: boolean
    isRequired?: boolean
    validate?: (value: string) => string | null | undefined
    variant?: 'primary' | 'secondary'
}

export default function SysModuleSelect(props : ISysModuleSelectProps) {
    const { value, onChange, isRequired, validate, variant = 'secondary',} = props
    const {data, isLoading} = SysCategoryHook.useGetSysModule()
    const {t} = useTranslation()
    const options = useMemo(() => {
        if (isLoading)
            return (
                <div className={'h-full w-full flex items-center justify-center'}>
                    <Spinner/>
                </div>
            )
        else if (!data) return <p>{MSG_LIST.NO_DATA}</p>
        else
            return (
                <ListBox>
                    {data.map((item) => (
                        <ListBox.Item
                            textValue={item.label}
                            key={item.value}
                            id={item.value}
                        >
                            <Label>{item.label}</Label>
                            <ListBox.ItemIndicator/>
                        </ListBox.Item>
                    ))}
                </ListBox>
            )
    }, [data])

    return (
        <ComboBox
            selectedKey={value}
            onSelectionChange={(key) => onChange(key?.toString() || '')}
            isRequired={isRequired}
            validate={(value) => validate?.(value.selectedKey as string)}
        >
            <Label>{t('sys_module')}</Label>
            <ComboBox.InputGroup>
                <Input variant={variant} placeholder={t('placeholder_select', {field: t('sys_module')})}/>
                <ComboBox.Trigger/>
            </ComboBox.InputGroup>
            <FieldError/>
            <ComboBox.Popover>{options}</ComboBox.Popover>
        </ComboBox>
    )
}
