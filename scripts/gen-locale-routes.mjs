#!/usr/bin/env node
/**
 * ============================================================================
 * GERADOR DAS ROTAS POR IDIOMA — `npm run gen:routes`
 * ============================================================================
 * Cada página do site existe em três endereços (português sem prefixo, /en e
 * /es). O conteúdo de verdade fica em views/ (um arquivo por página, que
 * recebe o idioma); as pastas de rota só repassam o idioma:
 *
 *   app/(pt)/…  → português   (o parêntese some do endereço: /about)
 *   app/en/…    → inglês      (/en/about)
 *   app/es/…    → espanhol    (/es/about)
 *
 * Esses arquivos de rota são todos iguais, mudando só o idioma — por isso são
 * GERADOS por este script e não devem ser editados à mão (a primeira linha de
 * cada um avisa). Para mudar uma página, edite o arquivo dela em views/.
 *
 * Quando rodar de novo:
 *   - página nova: crie views/<pagina>.tsx, acrescente em ROUTES e rode;
 *   - idioma novo: acrescente em LOCALES (aqui e em lib/i18n.ts) e rode.
 *
 * Por que pastas fixas em vez de uma pasta dinâmica app/[locale]: o
 * Cloudflare Pages (next-on-pages) não aceita páginas estáticas debaixo de
 * um trecho dinâmico do endereço — o build falha.
 * ============================================================================
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');

/** idioma → pasta dentro de app/. */
const LOCALES = { pt: '(pt)', en: 'en', es: 'es' };

const HEADER = '// GERADO por scripts/gen-locale-routes.mjs — não edite; mude views/ e rode `npm run gen:routes`.\n';

/** Página estática simples: metadados + componente de views/. */
const staticPage = (view, meta, component) => (l) => `${HEADER}import ${component}, { ${meta} } from '@/views/${view}';

export const metadata = ${meta}('${l}');

export default function Page() {
  return <${component} locale="${l}" />;
}
`;

/** arquivo (relativo à pasta do idioma) → conteúdo, dado o idioma. */
const ROUTES = {
  'layout.tsx': (l) => `${HEADER}import LocaleLayout, { layoutMetadata } from '@/views/layout';

export const metadata = layoutMetadata('${l}');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocaleLayout locale="${l}">{children}</LocaleLayout>;
}
`,
  'page.tsx': staticPage('home', 'homeMetadata', 'HomeView'),
  'about/page.tsx': staticPage('about', 'aboutMetadata', 'AboutView'),
  'terms/page.tsx': staticPage('terms', 'termsMetadata', 'TermsView'),
  'privacy/page.tsx': staticPage('privacy', 'privacyMetadata', 'PrivacyView'),
  'correcoes/page.tsx': staticPage('corrections', 'correctionsMetadata', 'CorrectionsView'),
  'esquemas/page.tsx': (l) => `${HEADER}import SchemesIndexView, { schemesIndexMetadata } from '@/views/schemes-index';

export const runtime = 'edge';
export const metadata = schemesIndexMetadata('${l}');

export default function Page() {
  return <SchemesIndexView locale="${l}" />;
}
`,
  'esquemas/[slug]/page.tsx': (l) => `${HEADER}import DossierView, { dossierMetadata } from '@/views/dossier';

export const runtime = 'edge';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return dossierMetadata('${l}', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <DossierView locale="${l}" slug={(await params).slug} />;
}
`,
  'esquemas/[slug]/opengraph-image.tsx': (l) => `${HEADER}import { dossierOgImage } from '@/views/dossier-og-image';
import { OG_SIZE } from '@/lib/ogImage';

export const runtime = 'edge';
export const alt = 'Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return dossierOgImage('${l}', (await params).slug);
}
`,
  'opengraph-image.tsx': (l) => `${HEADER}import { siteOgImage } from '@/views/og-image';
import { OG_SIZE } from '@/lib/ogImage';

export const alt = 'Teia da Corrupção';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return siteOgImage('${l}');
}
`,
  'not-found.tsx': () => `${HEADER}export { default } from '@/views/not-found';\n`,
  'error.tsx': () => `${HEADER}'use client';\n\nexport { default } from '@/views/error';\n`,
  // Qualquer endereço que não seja uma página cai aqui e vira 404 dentro do
  // layout do idioma (assim a página "não encontrada" sai no idioma certo).
  '[...rest]/page.tsx': () => `${HEADER}import { notFound } from 'next/navigation';

export const runtime = 'edge';

export default function CatchAll() {
  notFound();
}
`,
};

for (const [locale, dir] of Object.entries(LOCALES)) {
  rmSync(join(APP, dir), { recursive: true, force: true });
  for (const [file, content] of Object.entries(ROUTES)) {
    const path = join(APP, dir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content(locale));
  }
}
console.log(`Rotas geradas: ${Object.keys(ROUTES).length} arquivos × ${Object.keys(LOCALES).length} idiomas.`);
