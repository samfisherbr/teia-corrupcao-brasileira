// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import { dossierOgImage } from '@/views/dossier-og-image';
import { OG_SIZE } from '@/lib/ogImage';

export const runtime = 'edge';
export const alt = 'Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return dossierOgImage('pt', (await params).slug);
}
