import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { applyDocumentLanguage } from "./i18n";

export function useDocumentLanguage(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);

    const handleLanguageChanged = (language: string) => {
      applyDocumentLanguage(language);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);
}
