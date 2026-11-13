/**
 * Textos da interface por idioma. Uso:
 *   servidor:  const t = getMessages(locale);
 *   navegador: const { t, locale } = useI18n();   (components/I18nProvider.tsx)
 */
import type { Locale } from '@/lib/i18n';
import { pt, type Messages } from './pt';
import { en } from './en';
import { es } from './es';

const MESSAGES: Record<Locale, Messages> = { pt, en, es };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale] ?? pt;
export type { Messages };
