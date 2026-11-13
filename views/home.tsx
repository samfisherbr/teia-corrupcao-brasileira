/**
 * ============================================================================
 * PÁGINA INICIAL (/, /en, /es) — parte do SERVIDOR
 * (rotas: app/(pt)/page.tsx, app/en/page.tsx, app/es/page.tsx)
 * ============================================================================
 * Gerada no build (estática), uma vez por idioma. Duas camadas:
 *
 *  1. Texto em HTML: título, apresentação e a lista de dossiês. O grafo é um
 *     <canvas> — robôs de busca e leitores de tela não leem nada dele. Este
 *     bloco é a versão em texto da mesma página: fica visualmente oculto
 *     (`sr-only`), mas é lido por leitores de tela e pela busca, e os links
 *     funcionam pelo teclado.
 *  2. <GraphApp />: a aplicação interativa (components/GraphApp.tsx), que
 *     roda no navegador.
 *
 * Os títulos vêm de data/schemeDetails*.ts (sem banco, pois a página é
 * estática): um dossiê novo aparece aqui no deploy seguinte.
 * ============================================================================
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import GraphApp from '@/components/GraphApp';
import { DOSSIER_SCHEME_IDS, fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { schemePath } from '@/lib/schemes';
import { SITE_NAME } from '@/lib/site';
import { LOCALE_INFO, alternatesFor, localePath, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';

export function homeMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: `${SITE_NAME} — ${t.site.tagline}`,
    description: t.site.description,
    alternates: alternatesFor(locale, '/'),
    openGraph: { title: SITE_NAME, description: t.site.description, url: localePath(locale, '/'), type: 'website' },
  };
}

export default async function HomeView({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const details = await loadSchemeDetails(locale);
  const dossiers = DOSSIER_SCHEME_IDS.map((id) => ({ id, title: fallbackSchemeTitle(id, details) })).sort((a, b) =>
    a.title.localeCompare(b.title, LOCALE_INFO[locale].tag)
  );
  const href = (path: string) => localePath(locale, path);

  return (
    <>
      <div className="sr-only">
        <h1>{t.home.h1(SITE_NAME)}</h1>
        <p>{t.site.description}</p>
        <p>{t.home.legalNote}</p>
        <nav aria-label={t.home.dossiersNav}>
          <h2>{t.home.dossiersNav}</h2>
          <ul>
            <li>
              <Link href={href('/esquemas')}>{t.home.allSchemes}</Link>
            </li>
            {dossiers.map((d) => (
              <li key={d.id}>
                <Link href={href(schemePath(d.id))} prefetch={false}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.home.aboutNav}>
          <ul>
            <li><Link href={href('/about')} prefetch={false}>{t.home.aboutLink}</Link></li>
            <li><Link href={href('/correcoes')} prefetch={false}>{t.common.correctionsAndUpdates}</Link></li>
            <li><Link href={href('/privacy')} prefetch={false}>{t.common.privacyPolicy}</Link></li>
            <li><Link href={href('/terms')} prefetch={false}>{t.common.termsOfUse}</Link></li>
          </ul>
        </nav>
      </div>
      <GraphApp />
    </>
  );
}
