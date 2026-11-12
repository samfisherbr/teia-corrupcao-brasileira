/**
 * Imagem de compartilhamento de cada dossiê (/esquemas/<slug>), com o título
 * do caso. Gerada sob demanda no runtime edge; o título vem de
 * data/schemeDetails.ts (sem consulta ao banco). Desenho em lib/ogImage.tsx.
 */
import { fallbackSchemeTitle } from '@/lib/dossiers';
import { OG_SIZE, renderOgImage } from '@/lib/ogImage';
import { schemeIdFromSlug } from '@/lib/schemes';

export const runtime = 'edge';
export const alt = 'Dossiê do esquema na Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOgImage({ eyebrow: 'Dossiê', title: fallbackSchemeTitle(schemeIdFromSlug(slug)) });
}
