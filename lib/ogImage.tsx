/**
 * Imagem de compartilhamento (Open Graph, 1200×630) — a "capa" que aparece
 * quando um link do site é colado no WhatsApp, X, Telegram etc.
 *
 * Usada por app/opengraph-image.tsx (página inicial e páginas fixas) e por
 * app/esquemas/[slug]/opengraph-image.tsx (uma por dossiê, com o título).
 * O desenho usa só flexbox e cores (limitações do next/og: sem grid, sem
 * classes Tailwind, todo <div> com mais de um filho precisa de display:flex).
 */
import { ImageResponse } from 'next/og';
import { SITE_DOMAIN, SITE_NAME } from '@/lib/site';

export const OG_SIZE = { width: 1200, height: 630 };

/** Bolinhas decorativas nas cores dos tipos de entidade do grafo. */
const DOTS = [
  { c: '#ff00c8', x: 930, y: 120, s: 120 },
  { c: '#3b38ff', x: 1060, y: 300, s: 76 },
  { c: '#00eeff', x: 880, y: 330, s: 46 },
  { c: '#878787', x: 1010, y: 470, s: 60 },
  { c: '#ffffff', x: 820, y: 500, s: 30 },
];

export function renderOgImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) {
  // Títulos longos diminuem para caber em até ~4 linhas.
  const fontSize = title.length > 70 ? 52 : title.length > 40 ? 64 : 78;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#080d16',
          color: '#f1f5f9',
          fontFamily: 'sans-serif',
        }}
      >
        {DOTS.map((d) => (
          <div
            key={`${d.x}-${d.y}`}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s,
              borderRadius: d.s,
              border: `4px solid ${d.c}`,
              backgroundColor: `${d.c}22`,
            }}
          />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: 860, height: '100%' }}>
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#22d3ee' }}>
            {eyebrow}
          </div>
          <div style={{ display: 'flex', fontSize, fontWeight: 700, lineHeight: 1.12 }}>{title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 26, color: '#94a3b8' }}>
            <div style={{ display: 'flex' }}>{footer ?? 'A situação jurídica e a fonte de cada vínculo'}</div>
            <div style={{ display: 'flex', marginTop: 8, color: '#e2e8f0' }}>
              {SITE_NAME} · {SITE_DOMAIN}
            </div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
