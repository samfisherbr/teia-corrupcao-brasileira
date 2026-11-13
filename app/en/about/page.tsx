// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import AboutView, { aboutMetadata } from '@/views/about';

export const metadata = aboutMetadata('en');

export default function Page() {
  return <AboutView locale="en" />;
}
