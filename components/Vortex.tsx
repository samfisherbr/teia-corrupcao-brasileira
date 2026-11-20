'use client';

/**
 * ============================================================================
 * VORTEX — fundo animado: túnel em espiral de anéis e partículas (canvas 2D)
 * ============================================================================
 * Anéis elípticos formam um funil (perfil de "poço gravitacional"): largos e
 * quase circulares na boca, estreitos e achatados na garganta. Os anéis
 * deslizam continuamente para dentro (loop infinito) e milhares de partículas
 * orbitam sobre eles, mais rápido quanto mais fundo.
 *
 * Uso: <Vortex className="absolute inset-0" particleColor="#ffffff" />
 * O componente ocupa 100% do elemento pai.
 */

import { useEffect, useRef } from 'react';

export interface VortexProps {
  className?: string;
  /** Número de anéis do túnel. */
  discCount?: number;
  /** Total de partículas em órbita. */
  particleCount?: number;
  /** Cor das partículas (hex). */
  particleColor?: string;
  /** Cor do traço dos anéis (qualquer cor CSS). */
  discColor?: string;
  discLineWidth?: number;
  /** Raio da partícula em px. */
  particleSize?: number;
  /** Profundidade do túnel (0.5–2). */
  depth?: number;
  /** Escala horizontal da boca do túnel (0.5–2). */
  spread?: number;
  /** Multiplicador de velocidade. */
  speed?: number;
  /** 1 = horário, -1 = anti-horário. */
  rotationDirection?: 1 | -1;
  /** Ponto focal horizontal (0–1). */
  centerX?: number;
  /** Deslocamento vertical do centro (fração da altura, -0.5–0.5). */
  centerY?: number;
  /** Faixa (0–1) em que os anéis surgem na boca. */
  fadeInThreshold?: number;
  /** Faixa (0–1) em que os anéis somem na garganta. */
  fadeOutThreshold?: number;
  opacity?: number;
  /** O centro do túnel segue levemente o cursor. */
  cursorInteraction?: boolean;
}

interface Disc {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  t: number;
  a: number;
}

const TAU = Math.PI * 2;

export default function Vortex({
  className = '',
  discCount = 50,
  particleCount = 10000,
  particleColor = '#ffffff',
  discColor = 'rgba(200, 200, 200, 0.15)',
  discLineWidth = 1,
  particleSize = 0.5,
  depth = 1.7,
  spread = 1,
  speed = 0.05,
  rotationDirection = 1,
  centerX = 0.5,
  centerY = 0,
  fadeInThreshold = 0.021,
  fadeOutThreshold = 0.4,
  opacity = 1,
  cursorInteraction = true,
}: VortexProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0;
    let H = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Partículas: cada uma presa a um anel, com ângulo, jitter radial e brilho próprios.
    const D = Math.max(1, Math.floor(discCount));
    const N = Math.max(0, Math.floor(particleCount));
    const pDisc = new Uint16Array(N);
    const pAng = new Float32Array(N);
    const pJit = new Float32Array(N);
    const pBright = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pDisc[i] = Math.floor(Math.random() * D);
      pAng[i] = Math.random() * TAU;
      pJit[i] = 1 + (Math.random() - 0.5) * 0.012;
      pBright[i] = Math.random() ** 2;
    }
    const discs: Disc[] = Array.from({ length: D }, () => ({ cx: 0, cy: 0, rx: 0, ry: 0, t: 0, a: 0 }));

    // Cursor: deslocamento suavizado do centro.
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
    };
    if (cursorInteraction) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    // Geometria do anel em função de t: 0 = boca (larga), 1 = garganta (funda).
    const R0 = 0.18;
    const K = 2.8;
    const geom = (t: number, d: Disc) => {
      const R = Math.min(W * 0.48, H * 0.85) * spread;
      const r = R0 + ((1 - R0) * (1 - t)) / (1 + K * t);
      const u = (r - R0) / (1 - R0);
      const s = Math.min(1, Math.max(0, (u - 0.08) / 0.4));
      const flat = 0.08 + 0.5 * s * s * (3 - 2 * s); // redondo na boca, achatado na garganta
      // Parallax: anéis mais fundos acompanham mais o cursor.
      const par = t * t;
      d.rx = r * R;
      d.ry = d.rx * flat;
      d.cx = W * centerX + mouse.x * W * 0.06 * par;
      d.cy = H * (0.45 + centerY) + t * t * H * 0.21 * depth + mouse.y * H * 0.05 * par;
      d.t = t;
      const fin = t / Math.max(fadeInThreshold, 1e-4);
      const fout = (1 - t) / Math.max(fadeOutThreshold, 1e-4);
      d.a = Math.max(0, Math.min(1, fin, fout));
    };

    let phase = 0;
    let rot = 0;
    let last = performance.now();
    let raf = 0;
    const size = Math.max(0.5, particleSize * 2);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = discLineWidth;
      ctx.strokeStyle = discColor;
      for (let i = 0; i < D; i++) {
        const d = discs[i];
        geom((i / D + phase) % 1, d);
        if (d.a <= 0.01) continue;
        ctx.globalAlpha = d.a * opacity;
        ctx.beginPath();
        ctx.ellipse(d.cx, d.cy, d.rx, d.ry, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = particleColor;
      for (let i = 0; i < N; i++) {
        const d = discs[pDisc[i]];
        if (d.a <= 0.01) continue;
        // Velocidade angular cresce rumo à garganta.
        const ang = pAng[i] + rot * (0.4 + 1.6 * d.t);
        const x = d.cx + Math.cos(ang) * d.rx * pJit[i];
        const y = d.cy + Math.sin(ang) * d.ry * pJit[i];
        ctx.globalAlpha = d.a * pBright[i] * opacity;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phase = (phase + dt * speed * 0.6) % 1;
      rot += dt * speed * 6 * rotationDirection;
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || reduceMotion) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      draw(); // quadro estático
      ro.disconnect();
      const ro2 = new ResizeObserver(() => {
        resize();
        draw();
      });
      ro2.observe(wrap);
      return () => {
        ro2.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }
    start();

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [
    discCount, particleCount, particleColor, discColor, discLineWidth, particleSize,
    depth, spread, speed, rotationDirection, centerX, centerY,
    fadeInThreshold, fadeOutThreshold, opacity, cursorInteraction,
  ]);

  return (
    <div ref={wrapRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
}
