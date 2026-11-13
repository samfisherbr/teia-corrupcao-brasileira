// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import { siteOgImage } from '@/views/og-image';
import { OG_SIZE } from '@/lib/ogImage';

export const alt = 'Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return siteOgImage('pt');
}
