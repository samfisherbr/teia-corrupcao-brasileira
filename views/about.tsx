/**
 * Página "Sobre" (/about, /en/about, /es/about). Conteúdo estático, pré-renderizado no
 * build uma vez por idioma (rotas geradas em app/(pt), app/en e app/es). O texto de cada idioma fica em
 * content/legal/about.<idioma>.tsx (o português é o original); títulos em
 * `legal`, nos arquivos de messages/. Nome do site e e-mail vêm de
 * lib/site.ts.
 */
import React from 'react';
import type { Metadata } from 'next';
import { Network } from 'lucide-react';
import { EDITOR, SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import { LOCALE_INFO, alternatesFor, localePath, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import LegalPage from '@/components/LegalPage';
import BodyPt from '@/content/legal/about.pt';
import BodyEn from '@/content/legal/about.en';
import BodyEs from '@/content/legal/about.es';

const BODY: Record<Locale, React.ComponentType> = { pt: BodyPt, en: BodyEn, es: BodyEs };

export function aboutMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: `${t.legal.aboutMetaTitle} | ${SITE_NAME}`,
    description: t.legal.aboutMetaDescription(SITE_NAME),
    alternates: alternatesFor(locale, '/about'),
  };
}

export default async function AboutView({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const Body = BODY[locale];
  // Dados estruturados: quem publica o site (mesmo nome da seção "Quem faz").
  const site = `https://${SITE_DOMAIN}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${site}${localePath(locale, '/about')}`,
    inLanguage: LOCALE_INFO[locale].tag,
    mainEntity: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: site,
      creator: { '@type': 'Person', name: EDITOR.name, givenName: EDITOR.givenName, familyName: EDITOR.familyName },
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <LegalPage
        locale={locale}
        path="/about"
        icon={<Network className="w-6 h-6" />}
        title={t.legal.aboutTitle(SITE_NAME)}
        subtitle={<p className="text-xs font-mono text-cyan-400 mt-0.5">{t.legal.aboutSubtitle}</p>}
      >
        <Body />
      </LegalPage>
    </>
  );
}
