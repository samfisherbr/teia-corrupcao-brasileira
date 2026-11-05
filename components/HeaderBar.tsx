'use client';

/**
 * HEADERBAR — barra superior fixa (64px, `h-16`).
 * Marca à esquerda (clique volta ao grafo), botões "Infográficos" e
 * "Glossário" (abrem o HeaderOverlay) e botão "Fechar" quando um painel está aberto.
 * Para adicionar uma nova página-painel: inclua o nome em `ActivePage`, crie o
 * botão aqui e o conteúdo em HeaderOverlay.tsx.
 */

import React from 'react';
import { Share2, PieChart, BookOpen, X } from 'lucide-react';

/** Qual "página" está visível: o grafo ou um dos painéis de tela cheia. */
export type ActivePage = 'graph' | 'infographics' | 'glossary';

interface HeaderBarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export default function HeaderBar({ activePage, setActivePage }: HeaderBarProps) {
  return (
    <header className="z-50 h-16 w-full glass-panel border-b border-slate-800/80 px-3 max-[359px]:px-2 sm:px-6 flex items-center justify-between relative bg-[#080d16]/90 backdrop-blur-md">
      {/* Brand Title & Navigation Buttons */}
      <div className="flex items-center space-x-2 sm:space-x-6 min-w-0">
        <button
          type="button"
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0"
          onClick={() => setActivePage('graph')}
          aria-label="Voltar ao grafo"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 glow-cyan shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          {/* Título: no celular (< 640px) some enquanto um painel está aberto,
              para caber Infográficos + Glossário + X. O logo continua e leva
              de volta ao grafo. */}
          <div className={`items-baseline space-x-1 sm:space-x-2 ${activePage === 'graph' ? 'flex' : 'hidden sm:flex'}`}>
            <span className="font-bold text-slate-100 tracking-normal sm:tracking-wider text-xs max-[359px]:text-[11px] sm:text-sm whitespace-nowrap">
              Teia da Corrupção
            </span>
          </div>
        </button>

        {/* Botões de navegação. Em telas < 390px (iPhone SE/mini, Androids
            compactos) os ícones somem e só o texto fica, para os dois botões
            caberem inteiros ao lado do título. */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-l border-slate-800/80 pl-2 max-[359px]:pl-1.5 sm:pl-6 shrink-0">
          <button
            onClick={() => setActivePage(activePage === 'infographics' ? 'graph' : 'infographics')}
            className={`flex items-center space-x-1.5 px-2 max-[359px]:px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              activePage === 'infographics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 glow-cyan'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
            }`}
          >
            <PieChart className="hidden min-[390px]:block w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Infográficos</span>
          </button>

          <button
            onClick={() => setActivePage(activePage === 'glossary' ? 'graph' : 'glossary')}
            className={`flex items-center space-x-1.5 px-2 max-[359px]:px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              activePage === 'glossary'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 glow-cyan'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
            }`}
          >
            <BookOpen className="hidden min-[390px]:block w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Glossário</span>
          </button>
        </nav>
      </div>

      {/* Botão FECHAR — aparece quando Infográficos/Glossário está aberto.
          Celular (< 640px, `sm`): só o ícone X, quadrado de 32px, para não
          encostar em "Glossário". Telas maiores: ícone + texto "Fechar".
          O aria-label mantém o nome "Fechar" para leitores de tela. */}
      {activePage !== 'graph' && (
        <button
          onClick={() => setActivePage('graph')}
          aria-label="Fechar"
          title="Fechar"
          className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-100 bg-slate-800/80 border border-slate-700/80 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg transition-all shrink-0 ml-2"
        >
          <X className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Fechar</span>
        </button>
      )}
    </header>
  );
}