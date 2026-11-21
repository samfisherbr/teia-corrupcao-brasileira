'use client';

/**
 * ============================================================================
 * ADSENSELOADER — carrega o Google AdSense DEPOIS da página e, nas regiões de
 * consentimento, só libera anúncios depois do consentimento do visitante
 * ============================================================================
 * Antes o script do AdSense ia no <head> de toda página e era a maior parte do
 * JavaScript não usado (PageSpeed: ~185 KiB, ~340 ms de CPU no celular). Agora:
 *
 *  1. Espera a página terminar de carregar (evento `load`) e o navegador ficar
 *     ocioso. Nada do Google é baixado antes disso.
 *  2. Pergunta a /api/consent-region se o visitante está no EEE, Reino Unido ou
 *     Suíça (lib/consentRegions.ts). Se a pergunta falhar, assume que sim.
 *  3. Região de consentimento: liga `adsbygoogle.pauseAdRequests = 1` ANTES de
 *     inserir o script (mecanismo do próprio AdSense para segurar os pedidos de
 *     anúncio). O script traz a mensagem de consentimento do Google; os
 *     anúncios só são liberados (`pauseAdRequests = 0`) quando o TCF informar
 *     que o visitante CONSENTIU com a finalidade 1 (guardar/ler informações no
 *     aparelho), ou que o GDPR não se aplica a ele. Quem recusa, ou não
 *     responde, não recebe nenhum pedido de anúncio.
 *     Fora dessas regiões: script normal, sem pausa.
 *
 * Os blocos <ins class="adsbygoogle"> (InArticleAd) podem fazer `push` antes do
 * script chegar: a fila window.adsbygoogle é processada quando ele carrega e,
 * se pausada, quando for liberada. Os Anúncios automáticos seguem a mesma pausa.
 * O link "Privacidade e cookies" (ConsentSettings.tsx) continua funcionando:
 * ele se registra em googlefc.callbackQueue, que o script lê quando carrega.
 * ============================================================================
 */

import { useEffect } from 'react';
import { ADSENSE_CLIENT } from '@/lib/site';

type TcData = {
  gdprApplies?: boolean;
  eventStatus?: string;
  listenerId?: number;
  purpose?: { consents?: Record<string, boolean> };
};
type TcfApi = (command: string, version: number, callback: (data: TcData, success: boolean) => void, param?: unknown) => void;
type AdsQueue = unknown[] & { pauseAdRequests?: 0 | 1 };

const SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
/** Tempo máximo de espera pelo navegador ocioso depois do `load`. */
const IDLE_TIMEOUT_MS = 2000;

/** Executa `fn` depois do evento `load` e com o navegador ocioso. */
function afterLoadAndIdle(fn: () => void): () => void {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => !cancelled && fn(), { timeout: IDLE_TIMEOUT_MS });
    else setTimeout(() => !cancelled && fn(), 1);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
  };
}

async function isConsentRequired(): Promise<boolean> {
  try {
    const res = await fetch('/api/consent-region', { cache: 'no-store' });
    if (!res.ok) return true;
    const data = (await res.json()) as { consentRequired?: unknown };
    return data.consentRequired !== false;
  } catch {
    return true;
  }
}

/** Libera os anúncios só quando o TCF trouxer consentimento (finalidade 1) ou GDPR não se aplicar. */
function releaseAdsAfterConsent(ads: AdsQueue) {
  const w = window;
  w.googlefc = w.googlefc || {};
  w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
  w.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => {
      // Versão 0 = a versão mais recente do TCF (como no exemplo do Google).
      // Tipo completo aqui (o global de ConsentSettings.tsx só traz gdprApplies).
      const tcfapi = w.__tcfapi as unknown as TcfApi | undefined;
      tcfapi?.('addEventListener', 0, (data, success) => {
        if (!success || !data) return;
        if (data.gdprApplies === false) {
          ads.pauseAdRequests = 0;
          return;
        }
        // 'tcloaded' = escolha já gravada antes; 'useractioncomplete' = escolha agora.
        if (data.eventStatus !== 'tcloaded' && data.eventStatus !== 'useractioncomplete') return;
        // Retirar o consentimento depois (link "Privacidade e cookies") volta a pausar.
        ads.pauseAdRequests = data.purpose?.consents?.['1'] === true ? 0 : 1;
      });
    },
  });
}

export default function AdSenseLoader() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    let cancelled = false;

    const stop = afterLoadAndIdle(async () => {
      const consentRequired = await isConsentRequired();
      if (cancelled) return;

      const ads: AdsQueue = (window.adsbygoogle = window.adsbygoogle || []) as AdsQueue;
      if (consentRequired) {
        // Tem de ser ligado ANTES de o script do AdSense carregar.
        ads.pauseAdRequests = 1;
        releaseAdsAfterConsent(ads);
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = SCRIPT_SRC;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return null;
}
