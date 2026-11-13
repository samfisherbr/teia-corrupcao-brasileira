'use client';

/**
 * Tela de erro de qualquer página (erro inesperado ao renderizar). Sem ela, o
 * visitante veria uma tela em branco. "Tentar novamente" refaz só a parte
 * que falhou; se o erro persistir, os links levam a páginas que não dependem
 * do grafo.
 */
import React, { useEffect } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, href } = useI18n();
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans flex flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-red-400 font-mono text-sm">{t.error.title}</span>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">{t.error.body}</p>
      {error.digest && <code className="text-[11px] text-slate-600">ref.: {error.digest}</code>}
      <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hover:text-cyan-200"
        >
          {t.common.tryAgain}
        </button>
        {/* <a> comum (recarrega tudo): o roteador do Next pode estar no estado que causou o erro. */}
        <a href={href('/esquemas')} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
          {t.error.seeSchemes}
        </a>
      </div>
    </div>
  );
}
