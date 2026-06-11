import { useTranslation } from '@/components/ui/layout/LanguageProvider'
import { LANGUAGES, isLanguage } from '@/libs/languageHelper'
import { Label, ListBox, Select } from '@heroui/react'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation()

  return (
    <Select
      aria-label={t('common.language')}
      className="w-20"
      value={language}
      onChange={(value) => {
        const nextLanguage = value?.toString()
        if (isLanguage(nextLanguage)) setLanguage(nextLanguage)
      }}
      variant="secondary"
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {LANGUAGES.map((lang) => (
            <ListBox.Item
              key={lang.key}
              id={lang.key}
              textValue={lang.name}
              aria-label={lang.name}
            >
              <Label>{lang.label}</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
