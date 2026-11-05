/**
 * Página "Política de Privacidade" (/privacy). Conteúdo estático.
 * Nome, domínio, e-mail e data de atualização vêm de lib/site.ts.
 * Revise o texto se passar a coletar outros dados (ex.: analytics, formulários).
 */
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, FileText } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site';

export const metadata = {
  title: `Política de Privacidade | ${SITE_NAME}`,
  description: `Política de privacidade e uso de cookies da ${SITE_NAME}.`,
};

// Classe reaproveitada nos links externos desta página.
const LINK_CLASS = 'text-cyan-400 underline hover:text-cyan-300';

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Política de Privacidade</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">Última atualização: {LEGAL_LAST_UPDATED}</p>
        </div>

        {/* Seções */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              1. Visão geral e compromisso
            </h2>
            <p>
              Na <strong>{SITE_NAME}</strong>, acessível em https://{SITE_DOMAIN}, a privacidade dos visitantes é uma
              prioridade. Este documento descreve quais informações são coletadas e registradas e como são usadas, em
              conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
            </p>
            <p>
              O site não exige cadastro nem login. Se tiver dúvidas ou precisar de mais informações sobre esta política,
              entre em contato.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Cookie className="w-4 h-4 text-cyan-400" />
              2. Cookies e publicidade de terceiros (Google AdSense)
            </h2>
            <p>
              A {SITE_NAME} pode usar cookies para guardar preferências de navegação e para exibir anúncios. Os cookies de
              publicidade são definidos por terceiros, conforme abaixo.
            </p>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 uppercase tracking-wider font-mono text-[11px]">
                Google e fornecedores terceiros:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  O Google, como fornecedor terceiro, usa cookies para exibir anúncios aos visitantes com base em suas
                  visitas a {SITE_DOMAIN} e a outros sites na internet.
                </li>
                <li>
                  Os cookies de publicidade permitem que o Google e seus parceiros exibam anúncios com base nas visitas do
                  usuário a este e a outros sites.
                </li>
                <li>
                  É possível desativar a publicidade personalizada nas{' '}
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    Configurações de anúncios do Google
                  </a>
                  . Também é possível recusar o uso de cookies de fornecedores terceiros para publicidade personalizada em{' '}
                  <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    www.aboutads.info
                  </a>
                  .
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              3. Registros de acesso (logs)
            </h2>
            <p>
              Como em praticamente todo serviço de hospedagem, o provedor do site (Cloudflare) registra automaticamente
              dados técnicos de acesso: endereço IP, tipo de navegador, provedor de internet, data e hora, páginas de
              origem e de saída. Essas informações são usadas para segurança, administração do site e estatísticas
              agregadas de uso, e não são associadas a nenhuma identificação pessoal.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              4. Políticas de privacidade de terceiros
            </h2>
            <p>
              Esta política não se aplica a anunciantes nem a sites externos para os quais o grafo aponta (como portais de
              notícias e tribunais). Recomendamos consultar as políticas de privacidade desses serviços.
            </p>
            <p>
              Você pode desativar os cookies nas configurações do seu navegador. Instruções específicas estão disponíveis
              nos sites de cada navegador.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">5. Seus direitos pela LGPD</h2>
            <p>
              Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li><strong>Confirmação e acesso</strong> — saber se tratamos dados seus e obter uma cópia deles.</li>
              <li><strong>Correção</strong> — corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li><strong>Anonimização, bloqueio ou eliminação</strong> — de dados desnecessários, excessivos ou tratados em desconformidade com a lei.</li>
              <li><strong>Informação sobre compartilhamento</strong> — saber com quais entidades seus dados são compartilhados.</li>
              <li><strong>Revogação do consentimento</strong> — quando o tratamento se basear nele.</li>
            </ul>
            <p className="text-xs text-slate-400">
              Também é possível apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">6. Contato</h2>
            <p>
              Dúvidas, sugestões ou pedidos relacionados a esta política podem ser enviados para{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
