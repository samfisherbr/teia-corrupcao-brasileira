'use client';

/**
 * SELETOR DE IDIOMA — bandeira + nome do idioma atual; ao clicar, abre a
 * lista com os outros idiomas. Escolher um idioma leva à MESMA página no
 * outro idioma (ex.: /esquemas/mensalao → /en/esquemas/mensalao).
 *
 * Onde aparece:
 *  - 'header'   no canto direito do cabeçalho do grafo (telas ≥ 640px);
 *  - 'floating' no celular, flutuando acima do botão "Termos & Privacidade"
 *               (no cabeçalho não cabe); a lista abre para cima;
 *  - 'page'     no topo das páginas de texto (dossiês, Sobre, Termos…).
 *
 * `path` = endereço da página atual SEM prefixo de idioma ("/", "/about",
 * "/esquemas/mensalao"). Vem de quem usa o componente, e não do endereço do
 * navegador, para o HTML gerado no servidor sair igual ao do navegador.
 *
 * Os links são <a> comuns (recarregam a página): trocar de idioma troca o
 * <html lang> e todos os textos, e os robôs de busca seguem os links.
 * Para acrescentar um idioma: lib/i18n.ts e a bandeira em FLAGS, abaixo.
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LOCALES, LOCALE_INFO, localePath, type Locale } from '@/lib/i18n';
import { useI18n } from '@/components/I18nProvider';

/** Bandeiras em miniatura (SVG embutido: emoji de bandeira não aparece no Windows). */
const FLAGS: Record<Locale, React.ReactNode> = {
  // Brasil
  pt: (
    <>
      <rect width="28" height="20" fill="#009c3b" />
      <path d="M14 2.4 25.2 10 14 17.6 2.8 10Z" fill="#ffdf00" />
      <circle cx="14" cy="10" r="4.4" fill="#002776" />
      <path d="M9.8 9.1a9 9 0 0 1 8.2 2.5" fill="none" stroke="#fff" strokeWidth="0.9" />
    </>
  ),
  // Reino Unido
  en: (
    <>
      <rect width="28" height="20" fill="#012169" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="6.6" />
      <path d="M14 0v20M0 10h28" stroke="#c8102e" strokeWidth="4" />
    </>
  ),
  // Espanha
  es: (
    <>
      <rect width="28" height="20" fill="#aa151b" />
      <rect y="5" width="28" height="10" fill="#f1bf00" />
    </>
  ),
};

function Flag({ locale }: { locale: Locale }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="20"
      height="14"
      className="w-5 h-3.5 shrink-0 rounded-[3px] ring-1 ring-white/15"
      aria-hidden="true"
      focusable="false"
    >
      {FLAGS[locale]}
    </svg>
  );
}

type Variant = 'header' | 'floating' | 'page';

const BUTTON_CLASS: Record<Variant, string> = {
  header:
    'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60',
  // Mesma caixa do botão "Termos & Privacidade" (NetworkGraph.tsx), para os dois parecerem um conjunto.
  floating:
    'px-3 py-3 rounded-lg text-xs leading-4 text-slate-300 hover:text-cyan-400 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 shadow-xl',
  page: 'px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-400 bg-slate-900 border border-slate-800 hover:border-slate-700',
};

export default function LanguageSwitcher({
  path,
  variant = 'page',
  className = '',
}: {
  path: string;
  variant?: Variant;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Fecha ao clicar/tocar fora ou apertar Esc (Esc devolve o foco ao botão).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Setas ↑ ↓ percorrem os idiomas da lista.
  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>('a'));
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length]?.focus();
  };

  const others = LOCALES.filter((l) => l !== locale);
  const opensUp = variant === 'floating';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => rootRef.current?.querySelector<HTMLAnchorElement>('ul a')?.focus());
          }
        }}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t.language.label}: ${LOCALE_INFO[locale].name}`}
        className={`flex items-center gap-2 transition-all cursor-pointer select-none whitespace-nowrap ${BUTTON_CLASS[variant]}`}
      >
        <Flag locale={locale} />
        <span>{LOCALE_INFO[locale].name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open !== opensUp ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <ul
        id={listId}
        hidden={!open}
        onKeyDown={onListKeyDown}
        className={`absolute right-0 z-50 min-w-full w-max bg-[#0e1726] border border-slate-800 rounded-lg p-1 shadow-2xl space-y-0.5 ${
          opensUp ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {others.map((l) => (
          <li key={l}>
            <a
              href={localePath(l, path)}
              hrefLang={LOCALE_INFO[l].tag}
              lang={LOCALE_INFO[l].tag}
              className="flex items-center gap-2 px-2.5 py-2 rounded text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-800 focus:outline-none focus-visible:bg-slate-800 focus-visible:text-cyan-400 whitespace-nowrap"
            >
              <Flag locale={l} />
              <span>{LOCALE_INFO[l].name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
