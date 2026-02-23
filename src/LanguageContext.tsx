import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { translations, type Lang } from "./translations"

const LANG_KEY = "app_lang"

type LanguageContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "hu"
    const stored = localStorage.getItem(LANG_KEY) as Lang | null
    return stored === "en" || stored === "hu" ? stored : "hu"
  })

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])

  const t = useCallback(
    (key: string) => translations[lang][key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
