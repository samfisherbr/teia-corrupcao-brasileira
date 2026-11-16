// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import SchemesIndexView, { schemesIndexMetadata } from '@/views/schemes-index';

// Lê o D1 a cada visita: sem isto o Next geraria a página no build, sem banco.
export const dynamic = 'force-dynamic';
export const metadata = schemesIndexMetadata('es');

export default function Page() {
  return <SchemesIndexView locale="es" />;
}
