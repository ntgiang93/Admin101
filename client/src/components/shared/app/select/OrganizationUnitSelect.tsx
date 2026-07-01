import { TreeSelect } from '@/components/ui/tree/TreeSelect'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'
import {OrganizationUnitHook} from "@/hooks/orgazination/organization-unit.ts";
import type {OrganizationUnitDto} from "@/types/sys/OrganizationUnit.ts";
import {useTranslation} from "react-i18next";

interface OrganizationUnitSelectProps {
    values: number[] | number
    onChange: (value: number[] | number) => void
    selectionMode?: 'single' | 'multiple'
    isRequired?: boolean
    anyLevel?: boolean
    isDisabled?: boolean
}

export default function OrganizationUnitSelect(props: OrganizationUnitSelectProps) {
    const {values, onChange, selectionMode, isRequired, anyLevel, isDisabled} = props;
    const { data } = OrganizationUnitHook.useGetAll()
    const {t} = useTranslation()
    const convertToTreeItem = (
        departments: OrganizationUnitDto[],
    ): SelectOptionType[] => {
        return departments.map((dept) => {
            const item: SelectOptionType = {
                value: dept.id,
                label: dept.name,
                description: dept.description || '',
                children: convertToTreeItem(dept.children || []),
            }
            return item
        })
    }

    const options = convertToTreeItem(data || [])

    return (
        <TreeSelect
            data={options}
            label={t('organization_unit')}
            values={values}
            placeholder={t('placeholder_select',{field: t('organization_unit')})}
            isRequired={isRequired}
            selectionMode={selectionMode}
            isDisabled={isDisabled}
            selectionStrategy={anyLevel ? 'all' : 'leaf'}
            onChange={(values) => {
                onChange(values as number | number[])
            }}
        />
    )
}
