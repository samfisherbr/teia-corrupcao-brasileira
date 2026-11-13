/**
 * Registro público de correções (/correcoes). Conteúdo estático, gerado no
 * build (uma vez por idioma) a partir de data/corrections.ts — para registrar
 * uma correção, edite aquele arquivo (as instruções estão no topo dele).
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { History } from 'lucide-react';
import { CORRECTIONS } from '@/data/corrections';
import { fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { formatDate } from '@/lib/format';
import { schemePath } from '@/lib/schemes';
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALE_INFO, alternatesFor, localePath, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import PageNav from '@/components/PageNav';

export function correctionsMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: `${t.common.correctionsAndUpdates} | ${SITE_NAME}`,
    description: t.corrections.metaDescription(SITE_NAME),
    alternates: alternatesFor(locale, '/correcoes'),
  };
}

export default async function CorrectionsView({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const details = await loadSchemeDetails(locale);
  const href = (path: string) => localePath(locale, path);
  // Mais recentes primeiro; no mesmo dia, mantém a ordem do arquivo.
  const entries = CORRECTIONS.map((c, i) => {
    const translated = locale === DEFAULT_LOCALE ? undefined : c.translations?.[locale];
    return { ...c, i, text: translated ?? c.summary, isTranslated: locale === DEFAULT_LOCALE || !!translated };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.i - b.i);

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <div className="max-w-3xl mx-auto space-y-8">
        <PageNav locale={locale} path="/correcoes" />

        <header className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <History className="w-8 h-8 shrink-0 text-cyan-400" aria-hidden="true" />
            {t.common.correctionsAndUpdates}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">{t.corrections.intro}</p>
        </header>

        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">{t.corrections.empty}</p>
        ) : (
          <ol className="space-y-3">
            {entries.map((c) => (
              <li key={c.i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono">
                  <time dateTime={c.date} className="font-bold text-slate-300">
                    {formatDate(c.date, locale) ?? c.date}
                  </time>
                  <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 uppercase tracking-wider text-[10px]">
                    {t.corrections.kind[c.kind]}
                  </span>
                </div>
                {c.scheme && (
                  <Link href={href(schemePath(c.scheme))} className="block text-sm font-bold text-cyan-400 hover:text-cyan-200 hover:underline">
                    {fallbackSchemeTitle(c.scheme, details)}
                  </Link>
                )}
                {/* Sem tradução: o texto sai em português, marcado como tal para leitores de tela. */}
                <p lang={c.isTranslated ? undefined : LOCALE_INFO[DEFAULT_LOCALE].tag} className="text-sm text-slate-300 leading-relaxed">
                  {c.text}
                </p>
              </li>
            ))}
          </ol>
        )}

        <footer className="pt-6 border-t border-slate-800 text-sm text-slate-400 leading-relaxed">
          {t.corrections.footerBefore}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
            {CONTACT_EMAIL}
          </a>
          {t.corrections.footerMiddle}{' '}
          <Link href={href('/terms')} className="text-cyan-400 hover:underline">
            {t.corrections.footerTerms}
          </Link>{' '}
          {t.corrections.footerAfter}
        </footer>
      </div>
    </div>
  );
}
