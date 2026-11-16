'use client';

/**
 * ADBANNER — bloco de anúncio do Google AdSense (728×90, só em telas ≥ 1536px).
 * Por que 1536px: o bloco fica centralizado na base do grafo, entre os
 * controles de câmera (esquerda) e o menu "Termos & Privacidade" (direita).
 * Abaixo disso (área do grafo = tela − barra lateral de 320px < ~1216px) ele
 * ficava POR CIMA desses botões e roubava os cliques. Ao mudar o tamanho do
 * bloco ou desses controles, confira a folga e ajuste AD_MIN_WIDTH_QUERY e a
 * classe `2xl:flex` juntos (2xl do Tailwind = 1536px).
 * O script do AdSense é carregado uma vez para o site todo em app/layout.tsx;
 * este componente só desenha o bloco e pede o anúncio.
 * IDs em lib/site.ts (ADSENSE_CLIENT e ADSENSE_SLOTS.banner, bloco "Network graph").
 * Posição: classes `bottom-3 left-1/2` do contêiner. Para outro formato,
 * troque largura/altura em `w-[728px] h-[90px]` e no `style` do <ins>.
 */

import React, { useEffect, useRef } from 'react';
import { useI18n } from '@/components/I18nProvider';

/** Mesma largura mínima da classe `2xl:flex` do contêiner (ver acima). */
const AD_MIN_WIDTH_QUERY = '(min-width: 1536px)';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  adClient: string; // e.g. "ca-pub-5667235064220150" (ADSENSE_CLIENT em lib/site.ts)
  adSlot: string;   // e.g. "2182726962"             (ADSENSE_SLOTS.banner em lib/site.ts)
}

export default function AdBanner({ adClient, adSlot }: AdBannerProps) {
  const pushedRef = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    // O bloco só existe em telas ≥ 1536px (`hidden 2xl:flex`). Pedir o anúncio
    // com o bloco oculto (celular, notebook) faz o AdSense lançar erro ("No slot size
    // for availableWidth=0") e gasta uma requisição à toa — então o pedido
    // só sai quando a tela é larga (inclusive se a janela for alargada depois).
    const wide = window.matchMedia(AD_MIN_WIDTH_QUERY);
    const request = () => {
      // React StrictMode runs effects twice in dev; AdSense throws on a double push.
      if (pushedRef.current || !wide.matches) return;
      pushedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };
    request();
    wide.addEventListener('change', request);
    return () => wide.removeEventListener('change', request);
  }, []);

  return (
    <>
      <div className="hidden 2xl:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="w-[728px] h-[90px] bg-surface-field/90 border border-slate-800 rounded-lg backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl relative">
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
          />
          <span className="absolute text-[10px] font-mono text-muted uppercase tracking-widest pointer-events-none -z-10">
            {t.common.advertising}
          </span>
        </div>
      </div>
    </>
  );
}
