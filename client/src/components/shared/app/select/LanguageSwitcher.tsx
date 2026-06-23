import { Label, ListBox, Select } from '@heroui/react'
import {useTranslation} from "react-i18next";
import {supportedLngs} from "@/i18n/config.ts";

export default function LanguageSwitcher() {
  const { i18n} = useTranslation();

  return (
    <Select
      aria-label={'languageSwitcher'}
      className="w-32"
      value={i18n.resolvedLanguage}
      onChange={(value) => {i18n.changeLanguage(value as string)
      }}
      variant="secondary"
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {Object.entries(supportedLngs).map(([code, name]) => (
              <ListBox.Item
                  key={code}
                  id={code}
                  textValue={code}
                  aria-label={code}
              >
                <Label>{name}</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
