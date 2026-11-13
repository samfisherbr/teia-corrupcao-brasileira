// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import CorrectionsView, { correctionsMetadata } from '@/views/corrections';

export const metadata = correctionsMetadata('en');

export default function Page() {
  return <CorrectionsView locale="en" />;
}
