/**
 * Página "Sobre" (/about). Conteúdo estático, pré-renderizado no build.
 * Nome do site e e-mail vêm de lib/site.ts.
 */
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Network, Info, Database, CheckCircle2, Scale } from 'lucide-react';
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/site';
import { STATUS_STYLE } from '@/lib/graphConfig';

export const metadata = {
  title: `Sobre | ${SITE_NAME}`,
  description: `Conheça o ${SITE_NAME}, visualizador de redes de relacionamento em casos de corrupção política no Brasil.`,
};

export default function AboutUsPage() {
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
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Sobre a {SITE_NAME}</h1>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">Visualizador de redes de corrupção política no Brasil</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Missão e propósito
            </h2>
            <p>
              A <strong>{SITE_NAME}</strong> é uma plataforma interativa que mapeia e visualiza as redes de relacionamento
              presentes em investigações de corrupção política, fraudes em contratos públicos e fluxos financeiros no Brasil.
            </p>
            <p>
              Nosso objetivo é tornar acessíveis, por meio de um grafo navegável, dossiês jurídicos extensos, relatórios de
              Comissões Parlamentares de Inquérito (CPIs) e reportagens investigativas. Ao mapear as entidades — políticos,
              partidos, empresas, operadores e esquemas — o usuário pode explorar como recursos públicos circularam entre
              diferentes operações ao longo do tempo.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Metodologia e rigor dos dados
            </h2>
            <p>
              Imparcialidade e precisão factual são a base da coleta de dados. Cada entidade e cada conexão do grafo segue
              regras estritas de fonte pública:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Documentos oficiais</span>
                </div>
                <p className="text-xs text-slate-400">
                  Decisões judiciais públicas, denúncias do MPF, processos no STF e STJ, operações da Polícia Federal e
                  relatórios de auditoria da CGU e do TCU.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Imprensa de referência</span>
                </div>
                <p className="text-xs text-slate-400">
                  Reportagens de veículos de grande circulação (G1, Folha de S.Paulo, Estadão, UOL, CNN Brasil, BBC Brasil,
                  Agência Brasil), sem blogs partidários nem alegações de fóruns não verificadas.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Neutralidade e direito de defesa
            </h2>
            <p>
              Cada conexão exibe o estágio jurídico em que o fato se encontra. Uma investigação ou denúncia não equivale a
              condenação, e a anulação de uma condenação não equivale a absolvição. As posições da defesa e as decisões
              favoráveis aos citados são registradas com o mesmo peso e em tom neutro.
            </p>
            {/* Lista gerada a partir de STATUS_STYLE, para nunca ficar diferente da legenda do grafo */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.values(STATUS_STYLE).map((st) => (
                <li key={st.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: st.color }} />
                  {st.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">Contato e correções</h2>
            <p>
              Encontrou uma informação imprecisa, uma decisão judicial mais recente ou um link de fonte quebrado? Escreva
              para{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
                {CONTACT_EMAIL}
              </a>
              . Pedidos de correção e de direito de resposta são analisados e, quando procedentes, aplicados.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
