/**
 * ============================================================================
 * PÁGINA INICIAL (/) — parte do SERVIDOR
 * ============================================================================
 * Gerada no build (estática). Duas camadas:
 *
 *  1. Texto em HTML: título, apresentação e a lista de dossiês. O grafo é um
 *     <canvas> — robôs de busca e leitores de tela não leem nada dele. Este
 *     bloco é a versão em texto da mesma página: fica visualmente oculto
 *     (`sr-only`), mas é lido por leitores de tela e pela busca, e os links
 *     funcionam pelo teclado.
 *  2. <GraphApp />: a aplicação interativa (components/GraphApp.tsx), que
 *     roda no navegador.
 *
 * Os títulos vêm de data/schemeDetails.ts (sem banco, pois a página é
 * estática): um dossiê novo aparece aqui no deploy seguinte.
 * ============================================================================
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import GraphApp from '@/components/GraphApp';
import { DOSSIER_SCHEME_IDS, fallbackSchemeTitle } from '@/lib/dossiers';
import { schemePath } from '@/lib/schemes';
import { SITE_NAME } from '@/lib/site';

const DESCRIPTION =
  'Mapa interativo dos esquemas de corrupção no Brasil desde 1989: políticos, partidos, empresas e operadores, com a situação jurídica e a fonte de cada vínculo.';

export const metadata: Metadata = {
  title: `${SITE_NAME} — mapa interativo dos esquemas de corrupção no Brasil`,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: SITE_NAME, description: DESCRIPTION, url: '/', type: 'website' },
};

export default function HomePage() {
  const dossiers = DOSSIER_SCHEME_IDS.map((id) => ({ id, title: fallbackSchemeTitle(id) })).sort((a, b) =>
    a.title.localeCompare(b.title, 'pt-BR')
  );

  return (
    <>
      <div className="sr-only">
        <h1>{SITE_NAME}: mapa interativo dos esquemas de corrupção no Brasil</h1>
        <p>{DESCRIPTION}</p>
        <p>
          Cada vínculo do mapa indica o estágio jurídico em que o fato se encontra. Investigação ou denúncia não
          equivale a condenação, e anulação de condenação não equivale a absolvição. O mapa é desenhado como imagem
          interativa; o mesmo conteúdo está disponível em texto nos dossiês abaixo.
        </p>
        <nav aria-label="Dossiês dos esquemas">
          <h2>Dossiês dos esquemas</h2>
          <ul>
            <li>
              <Link href="/esquemas">Todos os esquemas, do mais recente ao mais antigo</Link>
            </li>
            {dossiers.map((d) => (
              <li key={d.id}>
                <Link href={schemePath(d.id)} prefetch={false}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Sobre o site">
          <ul>
            <li><Link href="/about" prefetch={false}>Sobre e metodologia</Link></li>
            <li><Link href="/correcoes" prefetch={false}>Correções e atualizações</Link></li>
            <li><Link href="/privacy" prefetch={false}>Política de privacidade</Link></li>
            <li><Link href="/terms" prefetch={false}>Termos de uso</Link></li>
          </ul>
        </nav>
      </div>
      <GraphApp />
    </>
  );
}
