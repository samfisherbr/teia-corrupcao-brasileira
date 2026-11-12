/**
 * Página "Termos de Uso" (/terms). Conteúdo estático.
 * Nome, domínio e data de atualização vêm de lib/site.ts.
 */
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, FileCode, ExternalLink } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site';

export const metadata = {
  title: `Termos de Uso | ${SITE_NAME}`,
  description: `Termos e condições de uso da ${SITE_NAME}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsOfServicePage() {
  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-12 sm:px-8 md:px-16 lg:px-24 overflow-y-auto select-text">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Voltar ao grafo */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao painel</span>
        </Link>

        {/* Cabeçalho */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Termos de Uso</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">Última atualização: {LEGAL_LAST_UPDATED}</p>
        </div>

        {/* Seções */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">1. Aceitação dos termos</h2>
            <p>
              Ao acessar e usar a <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}), você declara que leu e concorda com estes
              termos. Se não concordar, não utilize o site.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              2. Natureza da plataforma e dos dados
            </h2>
            <p>
              A {SITE_NAME} é uma ferramenta de visualização de redes de caráter informativo, educacional e analítico. Os
              dados de entidades, resumos, referências judiciais e vínculos exibidos são compilados de documentos oficiais
              públicos, portais governamentais (como MPF, STF, STJ, CGU, TCU e relatórios de CPIs) e veículos de imprensa
              de referência.
            </p>
            <p>
              Embora busquemos precisão e neutralidade, a {SITE_NAME} não formula acusações próprias: limita-se a organizar
              informações já publicadas, indicando a fonte de cada vínculo e o estágio processual correspondente. As
              informações são oferecidas &quot;no estado em que se encontram&quot;, sem garantia de completude nem de
              atualização em tempo real das decisões judiciais.
            </p>
            <p>
              Investigação, denúncia ou condenação recorrível não significam culpa definitiva. Prevalece a presunção de
              inocência até o trânsito em julgado.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              3. Links externos e anúncios
            </h2>
            <p>
              O site contém links para sites e serviços de terceiros (portais de notícias, decisões judiciais em PDF e
              serviços de publicidade como o Google AdSense), que não pertencem nem são controlados pela {SITE_NAME}.
            </p>
            <p>
              A {SITE_NAME} não tem controle sobre o conteúdo, as políticas de privacidade ou as práticas desses sites e
              anunciantes, e não se responsabiliza por danos ou perdas decorrentes do uso desses conteúdos ou serviços.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              4. Isenção e limitação de responsabilidade
            </h2>
            <p>
              Na máxima extensão permitida pela legislação brasileira, a {SITE_NAME}, seus mantenedores e colaboradores não
              se responsabilizam por danos diretos, indiretos, incidentais ou consequentes decorrentes do acesso ou do uso
              da plataforma e das informações nela disponibilizadas.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">5. Correções e direito de resposta</h2>
            <p>
              Pessoas e instituições citadas podem solicitar correção de informações ou inclusão de seu posicionamento pelo
              e-mail{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
                {CONTACT_EMAIL}
              </a>
              , indicando o vínculo em questão e a fonte que fundamenta o pedido. As correções aplicadas ficam
              registradas, com data e motivo, em{' '}
              <Link href="/correcoes" className="text-cyan-400 hover:underline">
                Correções e atualizações
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">6. Alterações destes termos</h2>
            <p>
              Estes termos podem ser alterados a qualquer momento. A data de atualização no topo indica a versão vigente, e
              o uso continuado do site após uma alteração significa concordância com a nova versão.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
