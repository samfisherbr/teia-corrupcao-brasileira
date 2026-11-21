'use client';

/**
 * ============================================================================
 * CONSENTSETTINGS — link "Privacidade e cookies" (rever ou retirar o consentimento)
 * ============================================================================
 * A mensagem de consentimento para visitantes do Espaço Econômico Europeu, do
 * Reino Unido e da Suíça é a do Google (AdSense → Privacidade e mensagens →
 * Regulamentações europeias), carregada pelo próprio script do AdSense, que
 * components/AdSenseLoader.tsx insere em toda página depois que ela carrega.
 * Nada dela fica neste código.
 *
 * O texto da mensagem promete um link no site para mudar a escolha: é este.
 * Segue o padrão da documentação do Google (Privacy & Messaging JavaScript
 * API, developers.google.com/funding-choices/fc-api-docs):
 *  - fica OCULTO até a ferramenta do Google avisar que carregou
 *    (CONSENT_API_READY) e o TCF confirmar que o GDPR vale para o visitante
 *    (gdprApplies); fora dessas regiões, ou enquanto o site não estiver
 *    aprovado no AdSense, o Google não carrega a ferramenta e o link não aparece;
 *  - o clique chama googlefc.showRevocationMessage(), que apaga a escolha
 *    gravada e mostra a mensagem de novo.
 *
 *   <ConsentGate>…</ConsentGate>   mostra o conteúdo só onde o link funciona
 *   <ConsentSettingsButton …/>     o botão em si (use dentro de ConsentGate)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';

type TcData = { gdprApplies?: boolean; listenerId?: number };
type TcfApi = (command: string, version: number, callback: (data: TcData, success: boolean) => void, param?: unknown) => void;

declare global {
  interface Window {
    googlefc?: {
      callbackQueue?: Array<Record<string, () => void>>;
      showRevocationMessage?: () => void;
    };
    __tcfapi?: TcfApi;
  }
}

/** true quando a ferramenta de consentimento do Google carregou e o GDPR vale para este visitante. */
function useConsentSettingsAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let listenerId: number | undefined;

    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => {
        // Versão 0 = a versão mais recente do TCF (como no exemplo do Google).
        window.__tcfapi?.('addEventListener', 0, (data, success) => {
          if (data?.listenerId !== undefined) listenerId = data.listenerId;
          if (!cancelled) setAvailable(!!(success && data?.gdprApplies));
        });
      },
    });

    return () => {
      cancelled = true;
      if (listenerId !== undefined) window.__tcfapi?.('removeEventListener', 0, () => {}, listenerId);
    };
  }, []);

  return available;
}

/** Mostra `children` só para quem pode mudar a escolha de consentimento. */
export function ConsentGate({ children }: { children: React.ReactNode }) {
  return useConsentSettingsAvailable() ? <>{children}</> : null;
}

/** Botão que reabre a mensagem de consentimento do Google. Use dentro de <ConsentGate>. */
export function ConsentSettingsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.googlefc?.showRevocationMessage?.()} className={className}>
      {children}
    </button>
  );
}
