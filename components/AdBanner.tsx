'use client';

/**
 * ADBANNER — bloco de anúncio do Google AdSense (728×90) na base do grafo.
 * O script do AdSense é carregado uma vez para o site todo em app/layout.tsx;
 * este componente só desenha o bloco e pede o anúncio.
 * IDs em lib/site.ts (ADSENSE_CLIENT e ADSENSE_SLOTS.banner, bloco "Network graph").
 *
 * POSIÇÃO: o bloco fica na base do grafo, ENTRE os controles de câmera
 * (esquerda) e o menu "Termos & Privacidade" (direita) — os dois grupos
 * marcados com `data-ad-avoid="left" | "right"` em NetworkGraph.tsx.
 *   - centraliza-se no espaço livre entre eles (não no meio da tela: os
 *     dois grupos têm larguras diferentes, e mudam com o idioma);
 *   - só aparece se couber com pelo menos AD_MIN_GAP_PX de cada lado. Antes,
 *     em notebooks, ele ficava POR CIMA desses botões e roubava os cliques.
 * Na prática: aparece a partir de ~1536px de largura (1920px com zoom de
 * 125% no Windows), um pouco antes em inglês (rótulos mais curtos).
 * A medição é refeita ao redimensionar a janela, trocar o idioma e quando o
 * grafo (e os controles) terminam de carregar — antes disso o bloco não aparece.
 *
 * Para outro formato, troque AD_WIDTH_PX/AD_HEIGHT_PX (e o bloco no AdSense).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  adClient: string; // e.g. "ca-pub-5667235064220150" (ADSENSE_CLIENT em lib/site.ts)
  adSlot: string;   // e.g. "2182726962"             (ADSENSE_SLOTS.banner em lib/site.ts)
}

const AD_WIDTH_PX = 728;
const AD_HEIGHT_PX = 90;
/** Folga mínima entre o anúncio e cada grupo de controles. */
const AD_MIN_GAP_PX = 4;
/** Abaixo disto nem tenta (celular/tablet: sem espaço e sem barra lateral). */
const AD_MIN_VIEWPORT_PX = 1024;

export default function AdBanner({ adClient, adSlot }: AdBannerProps) {
  const pushedRef = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  /** Centro do anúncio (px, relativo ao <main>) ou null = não cabe / oculto. */
  const [centreX, setCentreX] = useState<number | null>(null);

  // Mede o espaço livre entre os dois grupos de controles.
  useEffect(() => {
    const host = boxRef.current?.parentElement; // o <main> (position: relative)
    if (!host) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (window.innerWidth < AD_MIN_VIEWPORT_PX) {
        setCentreX(null);
        return;
      }
      const hostRect = host.getBoundingClientRect();
      const left = host.querySelector('[data-ad-avoid="left"]')?.getBoundingClientRect();
      const right = host.querySelector('[data-ad-avoid="right"]')?.getBoundingClientRect();
      // Sem os controles ainda (grafo carregando) não dá para saber se cabe:
      // espera — senão o anúncio apareceria e seria pedido para depois sumir.
      if (!left || !right) {
        setCentreX(null);
        return;
      }
      const fits = right.left - left.right >= AD_WIDTH_PX + 2 * AD_MIN_GAP_PX;
      setCentreX(fits ? Math.round((left.right + right.left) / 2 - hostRect.left) : null);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    // Tamanho do <main> e dos dois grupos (idioma, fonte carregando…).
    const sizes = new ResizeObserver(schedule);
    const watched = new Set<Element>();
    const watchControls = () => {
      host.querySelectorAll('[data-ad-avoid]').forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        sizes.observe(el);
      });
      schedule();
    };
    sizes.observe(host);
    // Os controles só existem depois que o grafo carrega: observa a chegada.
    const arrivals = new MutationObserver(watchControls);
    arrivals.observe(host, { childList: true, subtree: true });
    watchControls();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      arrivals.disconnect();
    };
  }, []);

  // Pede o anúncio só quando o bloco aparece pela 1ª vez. Pedir com o bloco
  // oculto faz o AdSense lançar erro ("No slot size for availableWidth=0") e
  // gasta uma requisição à toa.
  const visible = centreX !== null;
  useEffect(() => {
    // React StrictMode roda efeitos 2× em desenvolvimento; o AdSense reclama de pedido duplo.
    if (!visible || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [visible]);

  return (
    <div
      ref={boxRef}
      className={`${visible ? 'flex' : 'hidden'} absolute bottom-3 -translate-x-1/2 z-20 pointer-events-auto`}
      style={{ left: centreX ?? 0 }}
    >
      <div
        className="bg-surface-field/90 border border-slate-800 rounded-lg backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl relative"
        style={{ width: AD_WIDTH_PX, height: AD_HEIGHT_PX }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${AD_WIDTH_PX}px`, height: `${AD_HEIGHT_PX}px` }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
        />
        <span className="absolute text-[10px] font-mono text-muted uppercase tracking-widest pointer-events-none -z-10">
          {t.common.advertising}
        </span>
      </div>
    </div>
  );
}
