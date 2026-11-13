// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import SchemesIndexView, { schemesIndexMetadata } from '@/views/schemes-index';

export const runtime = 'edge';
export const metadata = schemesIndexMetadata('es');

export default function Page() {
  return <SchemesIndexView locale="es" />;
}
