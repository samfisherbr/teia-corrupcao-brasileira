'use client';

/**
 * SHAREBUTTONS — compartilhar um dossiê: WhatsApp, Telegram, X e copiar link.
 * Os três primeiros são links comuns (funcionam sem JavaScript e sem
 * rastreadores de terceiros: nenhum script do WhatsApp/X é carregado); só o
 * "Copiar link" precisa de JavaScript. O endereço compartilhado é o canônico
 * do dossiê, sem parâmetros de campanha. A prévia (título, imagem) vem das
 * tags Open Graph da página.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

const BTN =
  'inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const { t } = useI18n();
  const s = t.dossier.share;
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const links = [
    { name: s.whatsapp, href: `https://wa.me/?text=${text}%20${u}` },
    { name: s.telegram, href: `https://t.me/share/url?url=${u}&text=${text}` },
    { name: s.x, href: `https://x.com/intent/post?text=${text}&url=${u}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
        <Share2 size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
        {s.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={BTN}>
            {l.name}
          </a>
        ))}
        <button type="button" onClick={copy} className={BTN}>
          {status === 'copied' ? (
            <Check size={16} className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
          ) : (
            <Link2 size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {s.copy}
        </button>
        <span role="status" aria-live="polite" className="self-center text-xs text-slate-400">
          {status === 'copied' ? s.copied : status === 'failed' ? s.copyFailed : ''}
        </span>
      </div>
    </div>
  );
}
