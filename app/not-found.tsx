/**
 * Página 404 (endereço inexistente, ou dossiê de esquema desconhecido).
 * Estática. Aponta para os lugares onde o conteúdo realmente está.
 */
import React from 'react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export const metadata = { title: `Página não encontrada | ${SITE_NAME}` };

export default function NotFound() {
  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans flex flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-cyan-400 font-mono text-sm">Erro 404</span>
      <h1 className="text-2xl font-bold text-white">Página não encontrada</h1>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">
        O endereço pode ter mudado ou o dossiê pode ter sido renomeado.
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <Link href="/" className="px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hover:text-cyan-200">
          Abrir a teia
        </Link>
        <Link href="/esquemas" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
          Ver todos os esquemas
        </Link>
      </div>
    </div>
  );
}
