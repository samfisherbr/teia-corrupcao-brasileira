'use client';

/**
 * ============================================================================
 * BLINKINGSQUARES — fundo animado: grade de quadradinhos que piscam (canvas 2D)
 * ============================================================================
 * Implementação própria, com as mesmas props do "Blinking Squares" do React
 * Bits Pro. A grade é densa junto à borda `direction` e vai esvaziando até
 * sumir no sentido oposto: entre `fadeStart` e `fadeEnd` (0–1, medidos a
 * partir da borda oposta) a chance de uma célula acender sobe segundo a curva
 * `falloff`. Cada célula acesa tem brilho aleatório entre `minBrightness` e 1
 * e oscila (pisca) com fase própria.
 *
 * Uso: <BlinkingSquares className="absolute inset-0" squareColor="#22d3ee" />
 * O componente ocupa 100% do elemento pai. Com "reduzir movimento" ligado no
 * sistema, desenha um quadro parado.
 */

import { useEffect, useRef } from 'react';

export interface BlinkingSquaresProps {
  className?: string;
  /** Borda onde os quadrados ficam densos; a grade some no sentido oposto. */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Número de células no eixo mais longo (8–200). */
  gridSize?: number;
  /** Lado do quadrado como fração da célula (0.05–0.98). */
  squareSize?: number;
  /** Onde a grade começa a aparecer ao longo de `direction` (0–1). */
  fadeStart?: number;
  /** Onde a grade atinge densidade máxima (0–1, > fadeStart). */
  fadeEnd?: number;
  /** Curva entre fadeStart e fadeEnd: 1 = linear, maior = rampa mais tardia. */
  falloff?: number;
  /** Brilho mínimo de uma célula acesa (0–1). */
  minBrightness?: number;
  /** Ciclos de piscada por segundo (0 congela). */
  twinkleSpeed?: number;
  /** Força da oscilação de brilho (0–1). */
  twinkleStrength?: number;
  /** Multiplicador de brilho (0–2). */
  intensity?: number;
  /** Alfa geral dos quadrados (0–1). */
  opacity?: number;
  /** Cor dos quadrados (hex). */
  squareColor?: string;
  /** Cor de fundo (qualquer cor CSS); omitida = transparente. */
  backgroundColor?: string;
  /** Teto do devicePixelRatio (1–3). */
  dpr?: number;
}

interface Cell {
  x: number;
  y: number;
  brightness: number;
  phase: number;
  rate: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function BlinkingSquares({
  className,
  direction = 'right',
  gridSize = 52,
  squareSize = 0.57,
  fadeStart = 0.65,
  fadeEnd = 1,
  falloff = 1.25,
  minBrightness = 0.55,
  twinkleSpeed = 1.4,
  twinkleStrength = 0.94,
  intensity = 1,
  opacity = 1,
  squareColor = '#BB29FF',
  backgroundColor,
  dpr = 1.5,
}: BlinkingSquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ratio = clamp(Math.min(window.devicePixelRatio || 1, dpr), 1, 3);
    const grid = clamp(Math.round(gridSize), 8, 200);
    const fill = clamp(squareSize, 0.05, 0.98);
    const span = Math.max(1e-3, fadeEnd - fadeStart);
    const curve = clamp(falloff, 0.3, 6);
    const minB = clamp(minBrightness, 0, 1);
    const strength = clamp(twinkleStrength, 0, 1);
    const gain = clamp(intensity, 0, 2) * clamp(opacity, 0, 1);

    let cells: Cell[] = [];
    let side = 0;
    let width = 0;
    let height = 0;

    // Sorteia as células acesas sempre que o tamanho muda.
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const cell = Math.max(width, height) / grid;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      side = cell * fill;
      const inset = (cell - side) / 2;
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Posição 0–1 ao longo de `direction` (1 = na borda densa).
          const u = (c + 0.5) / cols;
          const v = (r + 0.5) / rows;
          const t = direction === 'top' ? 1 - v : direction === 'bottom' ? v : direction === 'left' ? 1 - u : u;
          const density = Math.pow(clamp((t - fadeStart) / span, 0, 1), curve);
          if (density <= 0 || Math.random() >= density) continue;
          cells.push({
            x: c * cell + inset,
            y: r * cell + inset,
            brightness: minB + Math.random() * (1 - minB),
            phase: Math.random() * Math.PI * 2,
            rate: twinkleSpeed * (0.6 + Math.random() * 0.8),
          });
        }
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.fillStyle = squareColor;
      const s = time / 1000;
      for (const cell of cells) {
        const wave = 0.5 + 0.5 * Math.sin(cell.phase + s * cell.rate * Math.PI * 2);
        const alpha = cell.brightness * (1 - strength * wave) * gain;
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillRect(cell.x, cell.y, side, side);
      }
      ctx.globalAlpha = 1;
    };

    let frame = 0;
    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    layout();
    const animate = !reducedMotion && twinkleSpeed > 0 && strength > 0;
    if (animate) frame = requestAnimationFrame(loop);
    else draw(0);

    const ro = new ResizeObserver(() => {
      layout();
      if (!animate) draw(0);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [
    direction, gridSize, squareSize, fadeStart, fadeEnd, falloff, minBrightness,
    twinkleSpeed, twinkleStrength, intensity, opacity, squareColor, backgroundColor, dpr,
  ]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
