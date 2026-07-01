import {
    Autocomplete,
    EmptyState,
    FieldError,
    Label,
    ListBox,
    SearchField,
    useFilter,
} from '@heroui/react'
import {useMemo} from 'react'
import {OrganizationLevelHook} from "@/hooks/orgazination/organization-level.ts";
import {useTranslation} from "react-i18next";

interface OrganizationLevelSelectProps {
    value?: number | number[]
    onChange: (value: number | number[]) => void
    isRequired?: boolean
    validate?: (value: string | string[]) => string | null | undefined
    selectionMode?: 'single' | 'multiple'
    placeholder?: string
    className?: string
    parentLevel?: number
}

export default function OrganizationLevelSelect(props: OrganizationLevelSelectProps) {
    const {
        value,
        onChange,
        isRequired,
        validate,
        selectionMode = 'single',
        placeholder,
        className,
        parentLevel,
    } = props
    const {data, isLoading} = OrganizationLevelHook.useGetAll()
    const {t} = useTranslation();
    const {contains} = useFilter({sensitivity: 'base'})
    
    const items = useMemo(() => {
        if (!data) return []
        let filteredData = data
        const parent = data.find((item) => item.id === parentLevel)
        if (parent !== undefined) {
            filteredData = data.filter(
                (item) =>
                    item.rank !== undefined && item.rank > (parent.rank ?? 0),
            )
        }
        return filteredData.map((item) => ({
            value: item.code,
            label: item.name,
        }))
    }, [data, parentLevel])

    return (
        <Autocomplete
            placeholder={placeholder || t('placeholder_select',{field: t('organization_level')})}
            selectionMode={selectionMode}
            value={value}
            validate={(val) => (validate ? validate(val as string | string[]) : null)}
            isDisabled={isLoading}
            onChange={(val) => onChange(val as number | number[])}
            variant="secondary"
            className={className}
            isRequired={isRequired}
            allowsEmptyCollection
        >
            <Label>{t('organization_level')}</Label>
            <Autocomplete.Trigger>
                <Autocomplete.Value/>
                <Autocomplete.ClearButton/>
                <Autocomplete.Indicator/>
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
                <Autocomplete.Filter filter={contains}>
                    <SearchField autoFocus name="search" variant="secondary">
                        <SearchField.Group>
                            <SearchField.SearchIcon/>
                            <SearchField.Input placeholder={t('search')}/>
                            <SearchField.ClearButton/>
                        </SearchField.Group>
                    </SearchField>
                    <ListBox
                        renderEmptyState={() => (
                            <EmptyState>Không tìm thấy dữ liệu</EmptyState>
                        )}
                    >
                        {items.map((item) => (
                            <ListBox.Item
                                id={item.value}
                                key={item.value}
                                textValue={item.label}
                            >
                                {item.label}
                                <ListBox.ItemIndicator/>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Autocomplete.Filter>
            </Autocomplete.Popover>
            <FieldError/>
        </Autocomplete>
    )
}
