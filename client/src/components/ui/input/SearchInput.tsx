import { useTranslation } from '@/components/ui/layout/LanguageProvider'
import { Label, SearchField } from '@heroui/react'
import { useEffect, useState } from 'react'

interface ISearchInputProps {
  placeholder?: string
  className?: string
  label?: string
  value?: string
  onValueChange: (value: string) => void
  variant?: 'primary' | 'secondary'
}

export const SearchInput = (props: ISearchInputProps) => {
  const {
    placeholder,
    value,
    onValueChange,
    label,
    className,
    variant = 'secondary',
  } = props
  const [searchValue, setSearchValue] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    if (searchValue !== value) setSearchValue(value || '')
  }, [value])

  useEffect(() => {
    const handler = setTimeout(() => {
      onValueChange(searchValue)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  return (
    <SearchField
      name="search"
      value={searchValue}
      onChange={(value) => setSearchValue(value)}
      className={className}
      variant={variant}
    >
      <Label hidden={!label}>{label}</Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder={placeholder || t('common.search')} />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  )
}
