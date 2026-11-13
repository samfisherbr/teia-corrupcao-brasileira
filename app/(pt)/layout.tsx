// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.
import LocaleLayout, { layoutMetadata } from '@/views/layout';

export const metadata = layoutMetadata('pt');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocaleLayout locale="pt">{children}</LocaleLayout>;
}
