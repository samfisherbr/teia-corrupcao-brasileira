'use client';

/**
 * Página 404 (endereço inexistente, ou dossiê de esquema desconhecido), no
 * idioma do endereço. Aponta para os lugares onde o conteúdo realmente está.
 * O idioma vem do I18nProvider do layout (a mesma página serve aos três).
 */
import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans flex flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-cyan-400 font-mono text-sm">{t.notFound.code}</span>
      <h1 className="text-2xl font-bold text-white">{t.notFound.title}</h1>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">{t.notFound.body}</p>
      <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <Link href={href('/')} className="px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hover:text-cyan-200">
          {t.notFound.openGraph}
        </Link>
        <Link href={href('/esquemas')} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
          {t.notFound.seeSchemes}
        </Link>
      </div>
    </div>
  );
}
