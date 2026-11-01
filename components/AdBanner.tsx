'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  adClient: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  adSlot: string;   // e.g. "1234567890"
}

export default function AdBanner({ adClient, adSlot }: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="w-[728px] h-[90px] bg-[#0e1726]/90 border border-slate-800 rounded-lg backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl relative">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
        />
        {/* Fallback label during development or if ad blockers are active */}
        <span className="absolute text-[10px] font-mono text-slate-600 uppercase tracking-widest pointer-events-none -z-10">
          ADVERTISEMENT SPACE (728x90)
        </span>
      </div>
    </div>
  );
}