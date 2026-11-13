// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import AboutView, { aboutMetadata } from '@/views/about';

export const metadata = aboutMetadata('pt');

export default function Page() {
  return <AboutView locale="pt" />;
}
