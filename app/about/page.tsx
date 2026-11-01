import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Network, Info, Database, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Us | Teia da Corrupção',
  description: 'Learn about Teia da Corrupção - Political corruption relational network visualizer.',
};

export default function AboutUsPage() {
  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-12 sm:px-8 md:px-16 lg:px-24 overflow-y-auto select-text">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigation Back */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">About Teia da Corrupção</h1>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">Corruption Visualizer & Relational Network Intelligence</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Mission & Purpose
            </h2>
            <p>
              <strong>Teia da Corrupção</strong> is an interactive web platform engineered to map and visualize complex relational networks surrounding political corruption investigations, public contract fraud, and financial flows in Brazil.
            </p>
            <p>
              Our goal is to make dense, multi-page legal dossiers, parliamentary commission reports (CPIs), and investigative journalism accessible through intuitive graph-based visual intelligence. By mapping entities—politicians, corporations, shell companies, and schemes—users can explore how public funds move across systemic operations over time.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Methodology & Data Rigor
            </h2>
            <p>
              Impartiality and factual accuracy are the foundation of our data collection pipeline. Every node and connection mapped within the network strictly adheres to public-record sourcing rules:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Legal Repositories</span>
                </div>
                <p className="text-xs text-slate-400">
                  Data points are derived directly from public court rulings, MPF indictments, STF proceedings, Federal Police operations, and CGU/TCU audit reports.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>High-Reputation Outlets</span>
                </div>
                <p className="text-xs text-slate-400">
                  Documentary links reference established major news outlets (G1, Folha de S.Paulo, Estadão, UOL, CNN Brasil, BBC) without partisan blogs or unverified forum claims.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">Neutrality & Balanced Defense Disclosures</h2>
            <p>
              Teia da Corrupção tracks the official status of each link (whether confirmed by final sentence, under active investigation, or acquitted/annulled). Defense statements and legal outcomes are presented with equal weight and a neutral, non-sensational tone.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">Contact & Corrections</h2>
            <p>
              If you identify a factual discrepancy, updated court ruling, or broken source URL, please contact our editorial team at{' '}
              <a href="mailto:samfisherbr@gmail.com" className="text-cyan-400 underline">
                samfisherbr@gmail.com
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}