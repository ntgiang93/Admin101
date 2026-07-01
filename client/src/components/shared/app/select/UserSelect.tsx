import type {Key} from "@heroui/react";
import {
    Autocomplete,
    EmptyState,
    Label,
    ListBox,
    SearchField,
    Tag,
    TagGroup,
    useFilter,
} from "@heroui/react";
import {useTranslation} from "react-i18next";
import {useGetPaginationToSelect, UserHook} from "@/hooks/sys/user.ts";
import {defaultPaginationFilter, type PaginationFilter} from "@/types/base/PaginationFilter.ts";
import {SearchInput} from "@/components/ui/input/SearchInput.tsx";
import {type ChangeEvent, useState} from "react";
import type {UserSelectOptionsParams} from "@/types/sys/User.ts";

interface IUserSelectProps {
    value: string | string[]
    onChange: (value: string | string[]) => void
    selectionMode?: 'single' | 'multiple'
    isRequired?: boolean
    validate?: (value: string) => string | null | undefined
    variant?: 'primary' | 'secondary'
    label?: string
}

export default function UserSelect(props: IUserSelectProps) {
    const {value, onChange, selectionMode, label, isRequired, validate, variant = 'primary'} = props;
    const [filter, setFilter] = useState<UserSelectOptionsParams>({searchValue: ''})
    const {data, isFetching} = UserHook.useGetUserSelectOptions(filter)

    const {contains} = useFilter({sensitivity: "base"});
    const {t} = useTranslation();
    const items = data || [];
    const disableKey = data?.filter(x => !x.isActive).map((item => item.id)) || [];
    const onRemoveTags = (keys: Set<Key>) => {
        onChange(value instanceof Array ? value.filter((v) => !keys.has(v)) : '');
    };
    
    const handleChange = (keys: Key | Key[] | null) => {
        console.log('keys', keys)
    }

    return (
        <Autocomplete
            placeholder={t('placeholder_select', {field: t('user')})}
            selectionMode={selectionMode}
            value={value}
            onChange={ handleChange}
            variant={'secondary'}
            disabledKeys={disableKey}
        >
            <Label>{label || t('user')}</Label>
            <Autocomplete.Trigger>
                {selectionMode === "single" ?
                    (<Autocomplete.Value/>
                    ) : (<Autocomplete.Value>
                            {({defaultChildren, isPlaceholder, state}: any) => {
                                if (isPlaceholder || state.selectedItems.length === 0) {
                                    return defaultChildren;
                                }
                                const selectedItemsKeys = state.selectedItems.map((item: any) => item.key);
                                return (
                                    <TagGroup size="sm" onRemove={onRemoveTags}>
                                        <TagGroup.List>
                                            {selectedItemsKeys.map((selectedItemKey: Key) => {
                                                const item = items.find((s) => s.id === selectedItemKey);

                                                if (!item) return null;

                                                return (
                                                    <Tag key={item.id} id={item.id}>
                                                        {item.fullName}
                                                    </Tag>
                                                );
                                            })}
                                        </TagGroup.List>
                                    </TagGroup>
                                );
                            }}
                        </Autocomplete.Value>
                    )}
                <Autocomplete.Indicator/>
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
                <Autocomplete.Filter >
                    <SearchInput onValueChange={(value) => setFilter({...filter, searchValue: value})} value={filter.searchValue}/>
                    <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                        {items?.map((item) => (
                            <ListBox.Item key={item.id} id={item.id} textValue={item.userName}>
                                {item.fullName}
                                <ListBox.ItemIndicator/>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Autocomplete.Filter>
            </Autocomplete.Popover>
        </Autocomplete>
    );
}