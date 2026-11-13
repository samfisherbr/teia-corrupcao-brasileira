// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import TermsView, { termsMetadata } from '@/views/terms';

export const metadata = termsMetadata('en');

export default function Page() {
  return <TermsView locale="en" />;
}
