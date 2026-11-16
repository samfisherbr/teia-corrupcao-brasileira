// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import DossierView, { dossierMetadata } from '@/views/dossier';

// Lê o D1 a cada visita.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return dossierMetadata('en', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <DossierView locale="en" slug={(await params).slug} />;
}
