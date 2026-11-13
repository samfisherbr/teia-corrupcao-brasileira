/**
 * Página de dossiê de um esquema (/esquemas/<slug>, /en/esquemas/<slug>,
 * /es/esquemas/<slug> — o slug é o mesmo nos três idiomas).
 *
 * Renderizada no servidor a cada visita (runtime edge, lê o D1), para que o
 * Google e outros robôs leiam o texto inteiro: o grafo da página inicial é
 * desenhado num <canvas> e o Glossário só aparece depois de um clique, então
 * nenhum dos dois é legível para eles.
 *
 * Conteúdo: título e resumo vêm do banco (nó `scheme`); impacto, contexto,
 * funcionamento, situação jurídica e fontes vêm de data/schemeDetails.ts;
 * a lista "Quem aparece no caso" vem dos vínculos do banco — cada entidade
 * com o papel, o STATUS JURÍDICO, o ano e a FONTE daquele vínculo (é o que
 * sustenta cada citação; no grafo isso só aparece ao clicar numa linha).
 * Sem banco, a página sai só com o dossiê e o título de reserva. Esquema
 * desconhecido → 404.
 *
 * Idioma: textos do banco e do dossiê vêm no idioma do endereço. Se a tradução
 * do dossiê estiver ausente ou desatualizada, a página mostra o texto em
 * português com um aviso (`translationPending`, ver lib/dossiers.ts).
 *
 * Também saem daqui: a data "Revisado em" (reviewedAt do dossiê), os dados
 * estruturados JSON-LD (Article + BreadcrumbList) e, pelo arquivo vizinho
 * opengraph-image.tsx, a imagem de compartilhamento.
 *
 * Anúncio: um bloco "no artigo" (InArticleAd) dois parágrafos depois do
 * início — após o resumo e o contexto histórico —, como o Google recomenda.
 */
import React, { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CalendarCheck, Coins, ExternalLink, Languages, Network } from 'lucide-react';
import { FALLBACK_COLOR, NODE_STYLE, STATUS_STYLE, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import InArticleAd from '@/components/InArticleAd';
import { loadScheme, type SchemeConnection } from '@/lib/db';
import { fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { formatDate } from '@/lib/format';
import { localizeAmountText } from '@/lib/money';
import { schemeIdFromSlug, schemePath } from '@/lib/schemes';
import { SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALE_INFO, alternatesFor, localePath, type Locale } from '@/lib/i18n';
import { getMessages, type Messages } from '@/messages';
import PageNav from '@/components/PageNav';
import type { NodeType } from '@/types/graph';

const TYPE_ORDER = Object.keys(NODE_STYLE) as NodeType[];

/** Uma consulta ao banco por requisição, mesmo usada por generateMetadata e pela página. */
const getScheme = cache(async (slug: string, locale: Locale) => {
  const id = schemeIdFromSlug(slug);
  const [allDetails, db] = await Promise.all([loadSchemeDetails(locale), loadScheme(id, locale)]);
  const details = allDetails[id];
  if (!details && !db?.scheme) return null;
  const title = db?.scheme?.label ?? fallbackSchemeTitle(id, allDetails);
  const summary = db?.scheme?.summary ?? details?.context.split('. ')[0] ?? null;
  // Ordem: tipo (como na legenda do grafo), nome e ano.
  const connections = (db?.connections ?? []).sort(
    (a, b) =>
      TYPE_ORDER.indexOf(a.entity.type) - TYPE_ORDER.indexOf(b.entity.type) ||
      a.entity.label.localeCompare(b.entity.label, LOCALE_INFO[locale].tag) ||
      (a.year ?? 0) - (b.year ?? 0)
  );
  return { id, title, summary, details, connections };
});

export async function dossierMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const t = getMessages(locale);
  const s = await getScheme(slug, locale);
  if (!s) return { title: `${t.dossier.notFoundTitle} | ${SITE_NAME}` };
  return {
    title: `${s.title} | ${SITE_NAME}`,
    description: s.summary ?? t.dossier.fallbackDescription(s.title),
    alternates: alternatesFor(locale, schemePath(s.id)),
    openGraph: {
      title: s.title,
      description: s.summary ?? undefined,
      type: 'article',
      url: localePath(locale, schemePath(s.id)),
      modifiedTime: s.details?.reviewedAt,
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

/** Um vínculo do esquema: quem, com que papel, em que situação e segundo qual fonte. */
function ConnectionItem({ c, t, locale }: { c: SchemeConnection; t: Messages; locale: Locale }) {
  const Icon = NODE_ICONS[c.entity.type];
  const st = STATUS_STYLE[c.status];
  const color = st?.color ?? FALLBACK_COLOR;
  const reviewed = formatDate(c.reviewed_at, locale);
  const amount = localizeAmountText(c.amount, locale);
  return (
    <li className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium"
          style={entityChipStyle(c.entity.type)}
          title={t.nodeType[c.entity.type]?.label}
        >
          {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
          <span>
            {c.entity.label}
            {c.entity.party ? ` (${c.entity.party})` : ''}
          </span>
        </span>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded border"
          style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}
        >
          {t.status[c.status] ?? c.status}
        </span>
        {c.year && <span className="text-[11px] font-mono text-slate-400 tabular-nums">{c.year}</span>}
      </div>
      {c.relation && <p className="text-sm text-slate-300 leading-relaxed">{c.relation}</p>}
      {amount && (
        <p className="text-xs text-slate-400">
          <span className="font-mono">{t.dossier.amountCited}</span> <span className="text-emerald-400 font-mono">{amount}</span>
          {c.amount_note ? ` — ${c.amount_note}` : ''}
        </p>
      )}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {c.source_url && (
          <a
            href={c.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-200 hover:underline"
          >
            {t.dossier.source} {hostOf(c.source_url)}
            <ExternalLink size={12} className="w-3 h-3 shrink-0" aria-hidden="true" />
          </a>
        )}
        {reviewed && c.reviewed_at && (
          <span>
            {t.dossier.statusCheckedOn} <time dateTime={c.reviewed_at.slice(0, 10)}>{reviewed}</time>
          </span>
        )}
      </p>
    </li>
  );
}

/** "https://www.stf.jus.br/x/y" → "stf.jus.br" (texto do link da fonte). */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\d?\./, '');
  } catch {
    return 'link';
  }
}

/** JSON-LD seguro para <script>: "<" escapado para um texto não fechar a tag. */
const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });

export default async function DossierView({ locale, slug }: { locale: Locale; slug: string }) {
  const t = getMessages(locale);
  const s = await getScheme(slug, locale);
  if (!s) notFound();
  const { title, summary, details, connections } = s;
  const reviewed = formatDate(details?.reviewedAt, locale);
  const href = (path: string) => localePath(locale, path);
  const home = `https://${SITE_DOMAIN}${href('/')}`;
  const url = `https://${SITE_DOMAIN}${href(schemePath(s.id))}`;
  // Texto do dossiê exibido em português numa página de outro idioma (tradução pendente).
  const textLang = details?.translationPending ? LOCALE_INFO[DEFAULT_LOCALE].tag : undefined;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: summary ?? undefined,
      inLanguage: LOCALE_INFO[details?.translationPending ? DEFAULT_LOCALE : locale].tag,
      dateModified: details?.reviewedAt,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE_NAME, url: `https://${SITE_DOMAIN}` },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `https://${SITE_DOMAIN}` },
      citation: details?.sources.map((src) => src.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: home },
        { '@type': 'ListItem', position: 2, name: t.dossier.breadcrumbSchemes, item: `https://${SITE_DOMAIN}${href('/esquemas')}` },
        { '@type': 'ListItem', position: 3, name: title, item: url },
      ],
    },
  ];

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <article className="max-w-3xl mx-auto space-y-8">
        <PageNav locale={locale} path={schemePath(s.id)} links={[{ href: '/esquemas', label: t.dossier.allSchemes }]} />

        <header className="space-y-3 border-b border-slate-800 pb-6">
          <span
            className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded border"
            style={entityChipStyle('scheme')}
          >
            {t.nodeType.scheme.label}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white break-words">{title}</h1>
          {summary && <p className="text-base text-slate-300 leading-relaxed">{summary}</p>}
          {reviewed && details && (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-400">
              <CalendarCheck size={16} className="w-4 h-4 shrink-0 text-cyan-400" aria-hidden="true" />
              <span>
                {t.dossier.reviewedOn} <time dateTime={details.reviewedAt}>{reviewed}</time>.
              </span>
              <Link href={href('/correcoes')} className="text-cyan-400 hover:text-cyan-200 hover:underline">
                {t.common.correctionsAndUpdates}
              </Link>
            </p>
          )}
        </header>

        {details?.translationPending && (
          <p className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 leading-relaxed">
            <Languages size={16} className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
            <span>{t.dossier.translationPending}</span>
          </p>
        )}

        {details?.impact && (
          <div lang={textLang} className="flex items-start gap-2 p-4 rounded-lg bg-slate-900 border border-slate-800">
            <Coins size={16} className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-300">
              <span className="font-mono text-slate-400">{t.dossier.impact}</span>{' '}
              <strong className="font-medium text-slate-100">{details.impact}</strong>
            </p>
          </div>
        )}

        {details?.context && (
          <Section title={t.dossier.context}>
            <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.context}</p>
          </Section>
        )}

        {/* key: navegar entre dossiês recria o bloco e pede um anúncio novo. */}
        <InArticleAd key={s.id} />

        {details?.mechanism && (
          <Section title={t.dossier.mechanism}>
            <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.mechanism}</p>
          </Section>
        )}

        {connections.length > 0 && (
          <Section title={t.dossier.who}>
            <p className="text-xs text-slate-500 leading-relaxed">{t.dossier.whoNote}</p>
            <ul className="space-y-2">
              {connections.map((c) => (
                <ConnectionItem key={c.key} c={c} t={t} locale={locale} />
              ))}
            </ul>
          </Section>
        )}

        {details?.legalStatus && (
          <Section title={t.dossier.legal}>
            <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.legalStatus}</p>
          </Section>
        )}

        {details?.sources && details.sources.length > 0 && (
          <Section title={t.dossier.sources}>
            {t.dossier.sourcesInPortuguese && <p className="text-xs text-slate-500">{t.dossier.sourcesInPortuguese}</p>}
            <ul lang={LOCALE_INFO[DEFAULT_LOCALE].tag} className="space-y-1.5">
              {details.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-200 hover:underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <footer className="pt-6 border-t border-slate-800">
          <Link
            href={href('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-3 py-2 rounded-lg"
          >
            <Network size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t.dossier.explore}
          </Link>
        </footer>
      </article>
    </div>
  );
}
