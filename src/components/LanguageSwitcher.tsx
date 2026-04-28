import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../i18n/resources";

type SupportedLanguage = (typeof supportedLanguages)[number];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage;

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
      <Languages aria-hidden="true" className="size-4 text-blue-700" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        value={currentLanguage}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {t(`language.${language}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
