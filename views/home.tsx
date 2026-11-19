/**
 * ============================================================================
 * PÁGINA INICIAL (/, /en, /es) — parte do SERVIDOR
 * (rotas: app/(pt)/page.tsx, app/en/page.tsx, app/es/page.tsx)
 * ============================================================================
 * Gerada no build (estática), uma vez por idioma. Duas camadas:
 *
 *  1. <GraphApp />: a aplicação interativa (components/GraphApp.tsx), que
 *     roda no navegador e ocupa a primeira tela inteira.
 *  2. Texto em HTML, VISÍVEL, logo abaixo do grafo (rolando a página, pelo
 *     botão "Como ler o mapa" na base do grafo em telas ≥ 1024px, ou pelo
 *     item de mesmo nome no menu "Termos & Privacidade"): o que é o mapa, como lê-lo,
 *     os dossiês revisados por último, as últimas correções e a lista de
 *     todos os dossiês. O grafo é um <canvas> — busca, leitores de tela e o
 *     AdSense não leem nada dele; este texto é o conteúdo legível da página.
 *     Esta página não tem anúncio (ver ADSENSE_SLOTS em lib/site.ts).
 *
 * Rolagem: o contêiner externo rola (o <body> tem overflow-hidden). Sobre o
 * grafo, a roda do mouse e o arraste movem a câmera, não a página — por isso
 * o botão e o item de menu que descem até o texto.
 *
 * Os textos vêm de data/schemeDetails*.ts e data/corrections.ts (sem banco,
 * pois a página é estática): um dossiê ou correção nova aparece aqui no
 * deploy seguinte. Quantos itens mostrar: RECENT_DOSSIERS e RECENT_CORRECTIONS.
 * ============================================================================
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import GraphApp from '@/components/GraphApp';
import StatusList from '@/content/legal/StatusList';
import { ConsentGate, ConsentSettingsButton } from '@/components/ConsentSettings';
import { CORRECTIONS } from '@/data/corrections';
import { DOSSIER_SCHEME_IDS, fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { formatDate } from '@/lib/format';
import { NODE_STYLE } from '@/lib/graphConfig';
import { schemePath } from '@/lib/schemes';
import { HOME_TEXT_ID, SITE_NAME } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALE_INFO, alternatesFor, localePath, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import type { NodeType } from '@/types/graph';

/** Quantos dossiês (revisados por último) e correções aparecem no texto da página. */
const RECENT_DOSSIERS = 6;
const RECENT_CORRECTIONS = 3;

/** Primeira frase de um texto, para resumo ("A. B." → "A."). */
const firstSentence = (text: string): string => {
  const i = text.indexOf('. ');
  return i === -1 ? text : text.slice(0, i + 1);
};

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
  const tag = LOCALE_INFO[locale].tag;
  const ptTag = LOCALE_INFO[DEFAULT_LOCALE].tag;
  const href = (path: string) => localePath(locale, path);

  const dossiers = DOSSIER_SCHEME_IDS.map((id) => ({ id, title: fallbackSchemeTitle(id, details) })).sort((a, b) =>
    a.title.localeCompare(b.title, tag)
  );

  // Revisados por último primeiro (empate: título).
  const recent = DOSSIER_SCHEME_IDS.map((id) => ({ id, d: details[id] }))
    .filter((x) => x.d)
    .sort((a, b) => b.d.reviewedAt.localeCompare(a.d.reviewedAt) || a.d.title.localeCompare(b.d.title, tag))
    .slice(0, RECENT_DOSSIERS);

  // Mesma ordem de /correcoes: mais recentes primeiro; no mesmo dia, ordem do arquivo.
  const corrections = CORRECTIONS.map((c, i) => {
    const translated = locale === DEFAULT_LOCALE ? undefined : c.translations?.[locale];
    return { ...c, i, text: translated ?? c.summary, isTranslated: locale === DEFAULT_LOCALE || !!translated };
  })
    .sort((a, b) => b.date.localeCompare(a.date) || a.i - b.i)
    .slice(0, RECENT_CORRECTIONS);

  const h2 = 'text-lg font-semibold text-slate-100';
  const link = 'text-cyan-400 hover:text-cyan-200 hover:underline';

  return (
    <div className="relative h-dvh w-full overflow-y-auto overflow-x-hidden bg-surface-canvas">
      <GraphApp />

      <div id={HOME_TEXT_ID} className="w-full border-t border-slate-800 px-4 sm:px-8 py-12 text-slate-300 select-text">
        <div className="max-w-3xl mx-auto space-y-10 text-sm leading-relaxed">
          <header className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{t.home.h1(SITE_NAME)}</h1>
            <p className="text-base text-slate-300">{t.site.description}</p>
          </header>

          <section className="space-y-3">
            <h2 className={h2}>{t.home.aboutMapTitle}</h2>
            <p>{t.home.aboutMapBody}</p>
          </section>

          <section className="space-y-4">
            <h2 className={h2}>{t.home.howToReadTitle}</h2>
            <p>{t.home.circlesIntro}</p>
            <ul className="space-y-1.5">
              {(Object.keys(NODE_STYLE) as NodeType[]).map((type) => (
                <li key={type} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: NODE_STYLE[type].color }}
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold text-slate-100">{t.nodeType[type].label}</strong>: {t.home.nodeTypeHelp[type]}
                  </span>
                </li>
              ))}
            </ul>
            <p>{t.home.linesIntro}</p>
            <StatusList locale={locale} />
            <p>{t.home.legalNote}</p>
            <p>{t.home.howToUse}</p>
          </section>

          {recent.length > 0 && (
            <section className="space-y-4">
              <h2 className={h2}>{t.home.recentTitle}</h2>
              <ul className="space-y-3">
                {recent.map(({ id, d }) => (
                  <li key={id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <Link href={href(schemePath(id))} prefetch={false} className={`block font-bold ${link}`}>
                      {d.title}
                    </Link>
                    <p lang={d.translationPending ? ptTag : undefined} className="text-slate-300">
                      {firstSentence(d.context)}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      {t.home.reviewedOn}{' '}
                      <time dateTime={d.reviewedAt}>{formatDate(d.reviewedAt, locale) ?? d.reviewedAt}</time>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {corrections.length > 0 && (
            <section className="space-y-4">
              <h2 className={h2}>{t.home.correctionsTitle}</h2>
              <ol className="space-y-3">
                {corrections.map((c) => (
                  <li key={c.i} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono">
                      <time dateTime={c.date} className="font-bold text-slate-300">
                        {formatDate(c.date, locale) ?? c.date}
                      </time>
                      <span className="px-2 py-0.5 rounded-sm border border-slate-700 bg-slate-800 text-slate-300 uppercase tracking-wider text-[10px]">
                        {t.corrections.kind[c.kind]}
                      </span>
                      {c.scheme && (
                        <Link href={href(schemePath(c.scheme))} prefetch={false} className={`font-sans text-xs font-bold ${link}`}>
                          {fallbackSchemeTitle(c.scheme, details)}
                        </Link>
                      )}
                    </div>
                    <p lang={c.isTranslated ? undefined : ptTag}>{c.text}</p>
                  </li>
                ))}
              </ol>
              <Link href={href('/correcoes')} prefetch={false} className={`inline-block text-xs font-mono ${link}`}>
                {t.home.seeAllCorrections}
              </Link>
            </section>
          )}

          <nav aria-label={t.home.dossiersNav} className="space-y-4">
            <h2 className={h2}>{t.home.dossiersNav}</h2>
            <p>
              <Link href={href('/esquemas')} className={link}>
                {t.home.allSchemes}
              </Link>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {dossiers.map((d) => (
                <li key={d.id}>
                  <Link href={href(schemePath(d.id))} prefetch={false} className={link}>
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.home.aboutNav} className="pt-6 border-t border-slate-800">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono">
              <li><Link href={href('/about')} prefetch={false} className={link}>{t.home.aboutLink}</Link></li>
              <li><Link href={href('/correcoes')} prefetch={false} className={link}>{t.common.correctionsAndUpdates}</Link></li>
              <li><Link href={href('/privacy')} prefetch={false} className={link}>{t.common.privacyPolicy}</Link></li>
              <li><Link href={href('/terms')} prefetch={false} className={link}>{t.common.termsOfUse}</Link></li>
              <ConsentGate>
                <li><ConsentSettingsButton className={link}>{t.common.consentSettings}</ConsentSettingsButton></li>
              </ConsentGate>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
