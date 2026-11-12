/**
 * Imagem de compartilhamento padrão do site (gerada uma vez, no build).
 * Vale para a página inicial e para as páginas que não têm imagem própria.
 * Desenho em lib/ogImage.tsx.
 */
import { OG_SIZE, renderOgImage } from '@/lib/ogImage';

export const alt = 'Teia da Corrupção: mapa interativo de esquemas de corrupção no Brasil';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Mapa interativo',
    title: 'Esquemas de corrupção no Brasil, de 1989 até hoje',
  });
}
