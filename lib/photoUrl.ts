/**
 * Fotos dos nós redimensionadas pelo Cloudflare (Image Transformations).
 *
 * As fotos ficam no R2 (img.teiadacorrupcao.io) no tamanho em que forem
 * enviadas — inclusive originais grandes. O grafo desenha cada foto num
 * círculo de 192 px e o painel lateral a 64 px, então o site pede uma versão
 * de no máximo 256×256 (proporção mantida, nunca aumenta), em AVIF/WebP
 * conforme o navegador:
 *   https://teiadacorrupcao.io/cdn-cgi/image/<opções>/<url da foto no R2>
 * O Cloudflare gera a versão menor na primeira visita e a guarda em cache.
 * Não é preciso reduzir as fotos antes de enviar.
 *
 * Requisitos e limites:
 *   - "Transformations" ligado para a zona teiadacorrupcao.io
 *     (painel do Cloudflare → Images → Transformations);
 *   - plano gratuito: 5.000 transformações ÚNICAS por mês (cada foto conta
 *     uma vez por mês; o site tem ~150). Passou do limite: `onerror=redirect`
 *     manda o navegador para a foto original, que continua funcionando.
 *
 * Só no domínio próprio: nos endereços *.workers.dev (previews) e no `next dev` o
 * /cdn-cgi/image não existe, e as fotos vêm direto do R2. Quem usa
 * photoUrl() também tenta a original se a versão reduzida falhar.
 * Para desligar de vez: RESIZE_ENABLED = false.
 */
import { SITE_DOMAIN } from '@/lib/site';

const RESIZE_ENABLED = true;
/** Origem das fotos que podem ser redimensionadas (mesma zona do site). */
const PHOTO_HOST = 'img.teiadacorrupcao.io';
const COMMON = 'format=auto,quality=80,onerror=redirect';
/**
 * Pessoas (políticos e operadores): quadrado de 256 px recortado em volta do
 * rosto (detecção de rosto do Cloudflare; zoom 0 = mais fundo, 1 = só o rosto).
 * Sem rosto detectado, o recorte é pelo centro.
 */
const FACE_OPTIONS = `width=256,height=256,fit=cover,gravity=face,zoom=0.3,${COMMON}`;
/** Logos e demais (partidos, empresas, esquemas): imagem inteira, sem recorte, até 256 px. */
const WHOLE_OPTIONS = `width=256,height=256,fit=scale-down,${COMMON}`;
const FACE_TYPES = new Set(['politician', 'operator']);

/**
 * Versão reduzida da foto, ou null se não se aplica (outro domínio, SVG,
 * preview, dev). `nodeType` decide o recorte: rosto (pessoas) ou imagem inteira.
 */
export function resizedPhotoUrl(url: string | null | undefined, nodeType?: string | null): string | null {
  if (!RESIZE_ENABLED || !url || typeof window === 'undefined') return null;
  if (window.location.hostname !== SITE_DOMAIN) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== PHOTO_HOST) return null;
    // SVG (logos de partido) já é leve e o Cloudflare não redimensiona: vai direto.
    if (u.pathname.toLowerCase().endsWith('.svg')) return null;
  } catch {
    return null;
  }
  return `/cdn-cgi/image/${FACE_TYPES.has(nodeType ?? '') ? FACE_OPTIONS : WHOLE_OPTIONS}/${url}`;
}
