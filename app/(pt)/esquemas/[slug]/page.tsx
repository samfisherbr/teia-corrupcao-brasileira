// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import DossierView, { dossierMetadata } from '@/views/dossier';

export const runtime = 'edge';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return dossierMetadata('pt', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <DossierView locale="pt" slug={(await params).slug} />;
}
