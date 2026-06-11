import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type Language,
  type TranslationKey,
  getDefaultLanguage,
  isLanguage,
  translate,
} from '@/libs/languageHelper'
import Cookies from 'js-cookie'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const cookieLanguage = Cookies.get(LANGUAGE_STORAGE_KEY)
    if (isLanguage(cookieLanguage)) return cookieLanguage

    return getDefaultLanguage()
  })

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    Cookies.set(LANGUAGE_STORAGE_KEY, nextLanguage, { expires: 365 })
    document.documentElement.lang = nextLanguage
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)

  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => undefined,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        translate(DEFAULT_LANGUAGE, key, params),
    }
  }

  return context
}
