/**
 * Página "Política de Privacidade" (/privacy, /en/privacy, /es/privacy). Conteúdo estático, pré-renderizado no
 * build uma vez por idioma (rotas geradas em app/(pt), app/en e app/es). O texto de cada idioma fica em
 * content/legal/privacy.<idioma>.tsx (o português é o original); títulos em
 * `legal`, nos arquivos de messages/. Nome do site, e-mail e data de
 * atualização vêm de lib/site.ts.
 */
import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { SITE_NAME, LEGAL_LAST_UPDATED } from '@/lib/site';
import { formatDate } from '@/lib/format';
import { alternatesFor, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import LegalPage from '@/components/LegalPage';
import BodyPt from '@/content/legal/privacy.pt';
import BodyEn from '@/content/legal/privacy.en';
import BodyEs from '@/content/legal/privacy.es';

const BODY: Record<Locale, React.ComponentType> = { pt: BodyPt, en: BodyEn, es: BodyEs };

export function privacyMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: `${t.legal.privacyTitle} | ${SITE_NAME}`,
    description: t.legal.privacyMetaDescription(SITE_NAME),
    alternates: alternatesFor(locale, '/privacy'),
  };
}

export default async function PrivacyView({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const Body = BODY[locale];
  return (
    <LegalPage
      locale={locale}
      path="/privacy"
      icon={<ShieldCheck className="w-6 h-6" />}
      title={t.legal.privacyTitle}
      subtitle={<p className="text-xs font-mono text-slate-400">{t.legal.lastUpdated} {formatDate(LEGAL_LAST_UPDATED, locale)}</p>}
    >
      <Body />
    </LegalPage>
  );
}
