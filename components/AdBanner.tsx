'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  adClient: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX" (NEXT_PUBLIC_ADSENSE_CLIENT)
  adSlot: string;   // e.g. "1234567890"            (NEXT_PUBLIC_ADSENSE_SLOT)
}

/**
 * Rendered by page.tsx only when both env vars are set. Previously it was
 * always rendered with placeholder ids and the AdSense script was never
 * loaded, so it pushed into an array nobody read while covering the graph.
 */
export default function AdBanner({ adClient, adSlot }: AdBannerProps) {
  const pushedRef = useRef(false);

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
    <>
      <Script
        id="adsense"
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
      />
      <div className="hidden lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="w-[728px] h-[90px] bg-[#0e1726]/90 border border-slate-800 rounded-lg backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl relative">
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
          />
          <span className="absolute text-[10px] font-mono text-slate-600 uppercase tracking-widest pointer-events-none -z-10">
            Publicidade
          </span>
        </div>
      </div>
    </>
  );
}
