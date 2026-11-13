/**
 * Barra do topo das páginas de texto (dossiês, índice, correções, Sobre,
 * Termos, Privacidade): "Voltar ao painel" (e links extras) à esquerda e o
 * seletor de idioma à direita.
 *
 * `path` = endereço desta página sem prefixo de idioma (para o seletor levar
 * à mesma página no outro idioma).
 */
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { localePath, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';

export default function PageNav({
  locale,
  path,
  links = [],
}: {
  locale: Locale;
  path: string;
  /** Links extras depois de "Voltar ao painel" (endereços sem prefixo de idioma). */
  links?: { href: string; label: string }[];
}) {
  const t = getMessages(locale);
  return (
    <nav className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono min-w-0">
        <Link href={localePath(locale, '/')} className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
          {t.common.backToPanel}
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={localePath(locale, l.href)}
            className="border-l border-slate-600 pl-3 text-cyan-400 hover:text-cyan-300"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <LanguageSwitcher path={path} variant="page" className="shrink-0" />
    </nav>
  );
}
