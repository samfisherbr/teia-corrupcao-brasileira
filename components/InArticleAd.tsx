'use client';

/**
 * INARTICLEAD — anúncio "no artigo" do Google AdSense (formato fluido, se
 * ajusta à largura do texto). Usado nos dossiês (/esquemas/<slug>), dois
 * parágrafos depois do início, como o Google recomenda.
 * O script do AdSense é carregado uma vez para o site todo, depois da página,
 * por components/AdSenseLoader.tsx (que também segura os anúncios até o
 * consentimento no EEE/Reino Unido/Suíça); este componente só desenha o bloco
 * e põe o pedido na fila window.adsbygoogle.
 * IDs em lib/site.ts (ADSENSE_CLIENT, ADSENSE_SLOTS.inArticle).
 */

import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADSENSE_SLOTS } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

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
    <aside aria-label={t.common.advertising} className="group space-y-1">
      {/* O rótulo só aparece quando o AdSense preenche o bloco (data-ad-status="filled"):
          sem anúncio (conta em análise, sem consentimento, sem lance) ele ficava sozinho sobre um espaço vazio. */}
      <span className="hidden group-has-[ins[data-ad-status=filled]]:block text-[10px] font-mono text-muted uppercase tracking-widest">{t.common.advertising}</span>
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
