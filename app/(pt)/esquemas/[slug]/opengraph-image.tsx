// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import { dossierOgImage } from '@/views/dossier-og-image';
import { DOSSIER_SCHEME_IDS } from '@/lib/dossiers';
import { schemeSlug } from '@/lib/schemes';
import { OG_SIZE } from '@/lib/ogImage';

// A imagem só usa o título de data/schemeDetails*.ts (sem banco): é gerada no
// build, uma por dossiê, e servida como arquivo estático com cache longo. Gerar
// a cada pedido deixava o WhatsApp/Telegram/X esperando o Worker e, no limite
// de tempo deles, sem prévia. Dossiê fora da lista continua sendo gerado sob demanda.
export function generateStaticParams() {
  return DOSSIER_SCHEME_IDS.map((id) => ({ slug: schemeSlug(id) }));
}

export const alt = 'Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return dossierOgImage('pt', (await params).slug);
}
