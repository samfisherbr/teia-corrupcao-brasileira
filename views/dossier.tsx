/**
 * Página de dossiê de um esquema (/esquemas/<slug>, /en/esquemas/<slug>,
 * /es/esquemas/<slug> — o slug é o mesmo nos três idiomas).
 *
 * Renderizada no servidor a cada visita (Worker do Cloudflare, lê o D1), para que o
 * Google e outros robôs leiam o texto inteiro: o grafo da página inicial é
 * desenhado num <canvas> e o Glossário só aparece depois de um clique, então
 * nenhum dos dois é legível para eles.
 *
 * Conteúdo: título e resumo vêm do banco (nó `scheme`); impacto, contexto,
 * funcionamento, situação jurídica e fontes vêm de data/schemeDetails.ts;
 * a lista "Quem aparece no caso" vem dos vínculos do banco — um cartão por
 * entidade e, dentro dele, cada vínculo (fato) com o papel, o STATUS JURÍDICO,
 * o ano e a FONTE daquele vínculo (é o que sustenta cada citação; no grafo
 * isso só aparece ao clicar numa linha), em ordem cronológica; os cartões
 * ficam agrupados por tipo como as "Conexões Mapeadas" do painel lateral.
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
import { FALLBACK_COLOR, NODE_STYLE, STATUS_STYLE, badgeStyle, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import InArticleAd from '@/components/InArticleAd';
import ShareButtons from '@/components/ShareButtons';
import { loadScheme, type SchemeConnection } from '@/lib/db';
import { fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { formatDate } from '@/lib/format';
import { localizeAmountText } from '@/lib/money';
import { schemeIdFromSlug, schemePath } from '@/lib/schemes';
import { SITE_DOMAIN, SITE_NAME, EDITOR } from '@/lib/site';
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
      // `openGraph` da página SUBSTITUI o do layout (mescla rasa do Next): repita siteName e locale.
      siteName: SITE_NAME,
      locale: LOCALE_INFO[locale].og,
      publishedTime: s.details?.publishedAt,
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

/** Os vínculos de uma mesma entidade com o esquema (um por fato documentado), em ordem cronológica. */
interface EntityGroup {
  entity: SchemeConnection['entity'];
  facts: SchemeConnection[];
}

/** "1994–1997", "1995" ou null (nenhum fato com ano). */
function yearSpan(facts: SchemeConnection[]): string | null {
  const years = facts.map((f) => f.year).filter((y): y is number => !!y);
  if (years.length === 0) return null;
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}–${max}`;
}

/**
 * Corpo de um fato (um vínculo): papel, valor citado, situação jurídica,
 * fonte e data da conferência. Cada fato mantém a SUA situação e a SUA fonte —
 * agrupar por entidade não pode misturar o status de um fato com o de outro.
 */
function FactBody({ c, t, locale }: { c: SchemeConnection; t: Messages; locale: Locale }) {
  const st = STATUS_STYLE[c.status];
  const reviewed = formatDate(c.reviewed_at, locale);
  const amount = localizeAmountText(c.amount, locale);
  return (
    <div className="space-y-2">
      {c.relation && <p className="text-sm text-slate-400 leading-relaxed">{c.relation}</p>}
      {amount && (
        <p className="text-xs text-slate-400">
          <span className="font-mono">{t.dossier.amountCited}</span> <span className="text-emerald-400 font-mono">{amount}</span>
          {c.amount_note ? ` — ${c.amount_note}` : ''}
        </p>
      )}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm border"
          style={badgeStyle(st)}
        >
          {t.status[c.status] ?? c.status}
        </span>
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
    </div>
  );
}

/**
 * Uma entidade do esquema, no mesmo cartão das "Conexões Mapeadas" do painel
 * lateral (InspectorDrawer): borda esquerda na cor do tipo, nome no topo e o
 * período (ano do primeiro ao último fato) à direita.
 *
 * O banco guarda um vínculo por fato (a história processual fica em vínculos
 * separados — ver migrations/0005), então a mesma entidade pode ter vários.
 * Aqui eles viram UM cartão: com um só fato, o corpo aparece direto; com
 * vários, uma linha do tempo em ordem cronológica, cada fato com o seu ano,
 * situação jurídica e fonte. Nada é resumido nem omitido.
 */
function EntityItem({ g, t, locale }: { g: EntityGroup; t: Messages; locale: Locale }) {
  const typeColor = NODE_STYLE[g.entity.type]?.color ?? FALLBACK_COLOR;
  const span = yearSpan(g.facts);
  const multi = g.facts.length > 1;
  return (
    <li
      className="p-3 bg-slate-950 border border-slate-800 border-l-2 rounded-lg space-y-2"
      style={{ borderLeftColor: typeColor }}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-medium text-slate-200">
          {g.entity.label}
          {g.entity.party && g.entity.type === 'politician' && (
            <span className="ml-1 font-mono text-muted">({g.entity.party})</span>
          )}
        </span>
        <span className="shrink-0 flex items-center gap-1.5">
          {multi && <span className="text-[10px] font-mono text-muted">{t.dossier.factsCount(g.facts.length)}</span>}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-900 text-slate-400 border border-slate-800 tabular-nums">
            {span ?? t.common.notAvailable}
          </span>
        </span>
      </div>
      {multi ? (
        <ol className="space-y-3 border-l border-slate-800 ml-1">
          {g.facts.map((c) => (
            <li key={c.key} className="relative pl-4 space-y-1">
              <span
                className="absolute -left-[4.5px] top-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: typeColor }}
                aria-hidden="true"
              />
              <p className="text-[11px] font-mono font-semibold text-slate-300 tabular-nums">
                {c.year || t.common.notAvailable}
              </p>
              <FactBody c={c} t={t} locale={locale} />
            </li>
          ))}
        </ol>
      ) : (
        <FactBody c={g.facts[0]} t={t} locale={locale} />
      )}
    </li>
  );
}

/**
 * Entidades agrupadas por tipo (Partidos, Empresas, Políticos…), com o mesmo
 * cabeçalho de seção do painel lateral: ícone, nome no plural na cor do tipo
 * e a contagem — de ENTIDADES, não de vínculos. `connections` já chega
 * ordenado por tipo, nome e ano, então os fatos de cada entidade ficam
 * juntos e em ordem cronológica.
 */
function ConnectionSections({ connections, t, locale }: { connections: SchemeConnection[]; t: Messages; locale: Locale }) {
  const groups = new Map<NodeType, Map<string, EntityGroup>>();
  for (const c of connections) {
    let byEntity = groups.get(c.entity.type);
    if (!byEntity) groups.set(c.entity.type, (byEntity = new Map()));
    const g = byEntity.get(c.entity.id);
    if (g) g.facts.push(c);
    else byEntity.set(c.entity.id, { entity: c.entity, facts: [c] });
  }
  return (
    <div className="space-y-4">
      {[...groups].map(([type, byEntity]) => {
        const st = NODE_STYLE[type];
        const Icon = NODE_ICONS[type];
        const color = st?.color ?? FALLBACK_COLOR;
        const sectionTitle = t.nodeType[type]?.plural ?? t.inspector.others;
        return (
          <section key={type} aria-label={sectionTitle}>
            <h3
              className="flex items-center gap-2 mb-2 pb-1.5 border-b text-[11px] font-mono font-semibold uppercase tracking-wider"
              style={{ color: st?.labelColor ?? '#cbd5e1', borderColor: `${color}40` }}
            >
              {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{sectionTitle}</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-sm border text-[10px] leading-none" style={entityChipStyle(type)}>
                {byEntity.size}
              </span>
            </h3>
            <ul className="space-y-2">
              {[...byEntity.values()].map((g) => (
                <EntityItem key={g.entity.id} g={g} t={t} locale={locale} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
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
      datePublished: details?.publishedAt,
      dateModified: details?.reviewedAt,
      mainEntityOfPage: url,
      author: {
        '@type': 'Person',
        name: EDITOR.name,
        givenName: EDITOR.givenName,
        familyName: EDITOR.familyName,
        url: `https://${SITE_DOMAIN}${href('/about')}`,
      },
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
    <div className="h-[100dvh] w-full bg-surface-canvas text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <article className="max-w-3xl mx-auto space-y-8">
        <PageNav locale={locale} path={schemePath(s.id)} links={[{ href: '/esquemas', label: t.dossier.allSchemes }]} />

        <header className="space-y-3 border-b border-slate-800 pb-6">
          <span
            className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm border"
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
              <span>
                {t.dossier.editedBy}{' '}
                <Link href={href('/about')} className="text-cyan-400 hover:text-cyan-200 hover:underline">
                  {EDITOR.name}
                </Link>
                .
              </span>
              <Link href={href('/correcoes')} className="text-cyan-400 hover:text-cyan-200 hover:underline">
                {t.common.correctionsAndUpdates}
              </Link>
            </p>
          )}
          <ShareButtons url={url} title={title} />
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
            <p className="text-xs text-muted leading-relaxed">{t.dossier.whoNote}</p>
            <ConnectionSections connections={connections} t={t} locale={locale} />
          </Section>
        )}

        {details?.legalStatus && (
          <Section title={t.dossier.legal}>
            <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.legalStatus}</p>
          </Section>
        )}

        {details?.sources && details.sources.length > 0 && (
          <Section title={t.dossier.sources}>
            {t.dossier.sourcesInPortuguese && <p className="text-xs text-muted">{t.dossier.sourcesInPortuguese}</p>}
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
