'use client';

/**
 * Lista de dossiês com busca (página /esquemas). Mesma barra, mesmas regras e
 * mesma linha de contagem da busca do Glossário (HeaderOverlay): sem
 * diferenciar acentos/maiúsculas, todas as palavras digitadas precisam
 * aparecer, em qualquer campo (nome, resumo, textos do dossiê, entidades e
 * partidos ligados). A lista inteira vem renderizada do servidor (os robôs
 * de busca a leem); a filtragem acontece no navegador. Os itens já chegam no
 * idioma da página (título, resumo, link e texto pesquisável).
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { entityChipStyle, normalizeText } from '@/lib/graphConfig';
import { useI18n } from '@/components/I18nProvider';

export interface SchemeListItem {
  id: string;
  href: string;
  title: string;
  summary: string | null;
  year: number | null;
  /** Texto pesquisável já reunido no servidor. */
  terms: string;
}

export default function SchemeSearchList({ items }: { items: SchemeListItem[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const index = useMemo(() => new Map(items.map((i) => [i.id, normalizeText(i.terms)])), [items]);
  const filtered = useMemo(() => {
    const words = normalizeText(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return items;
    return items.filter((i) => words.every((w) => index.get(i.id)!.includes(w)));
  }, [items, index, query]);

  return (
    <>
      {/* Barra de busca: presa ao topo enquanto a lista rola (como no Glossário). */}
      <div
        role="search"
        className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-[#080d16]/95 backdrop-blur-md border-b border-slate-800/80"
      >
        <label htmlFor="esquemas-search" className="sr-only">
          {t.schemesIndex.searchLabel}
        </label>
        <div className="relative">
          <Search
            size={16}
            className="w-4 h-4 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="esquemas-search"
            type="search"
            autoComplete="off"
            placeholder={t.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('');
            }}
            aria-describedby="esquemas-search-count"
            className="w-full bg-[#0e1726] border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t.common.clearSearch}
              title={t.common.clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800"
            >
              <X size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          )}
        </div>
        <p id="esquemas-search-count" aria-live="polite" className="mt-2 text-[11px] font-mono text-slate-500">
          {query.trim()
            ? t.search.countFiltered(filtered.length, items.length)
            : t.search.countAll(items.length)}
        </p>
      </div>


      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">
            {t.search.noneFor} <strong className="text-slate-200">“{query.trim()}”</strong>.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
          >
            {t.common.clearSearch}
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border"
                    style={entityChipStyle('scheme')}
                  >
                    {t.schemesIndex.badge}
                  </span>
                  {item.year && (
                    <span className="text-[11px] font-mono font-bold text-slate-300 tabular-nums">{item.year}</span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-white">{item.title}</h2>
                {item.summary && <p className="mt-1 text-sm text-slate-400 leading-relaxed line-clamp-2">{item.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
