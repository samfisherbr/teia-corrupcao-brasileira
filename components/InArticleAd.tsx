'use client';

/**
 * INARTICLEAD — anúncio "no artigo" do Google AdSense (formato fluido, se
 * ajusta à largura do texto). Usado nos dossiês (/esquemas/<slug>), dois
 * parágrafos depois do início, como o Google recomenda.
 * O script do AdSense é carregado uma vez para o site todo em app/layout.tsx;
 * este componente só desenha o bloco e pede o anúncio.
 * IDs em lib/site.ts (ADSENSE_CLIENT, ADSENSE_SLOTS.inArticle).
 */

import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADSENSE_SLOTS } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

export default function InArticleAd() {
  const pushedRef = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    // React StrictMode runs effects twice in dev; AdSense throws on a double push.
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <aside aria-label={t.common.advertising} className="space-y-1">
      <span className="block text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t.common.advertising}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOTS.inArticle}
      />
    </aside>
  );
}
