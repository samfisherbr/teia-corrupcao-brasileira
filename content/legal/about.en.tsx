/**
 * Página "Sobre" — tradução para o INGLÊS de about.pt.tsx (o original).
 */
import React from 'react';
import Link from 'next/link';
import { Info, Database, CheckCircle2, Scale } from 'lucide-react';
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';
import StatusList from './StatusList';

export default function AboutEn() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Mission and purpose
        </h2>
        <p>
          <strong>{SITE_NAME}</strong> (&ldquo;Web of Corruption&rdquo;) is an interactive platform that maps and
          visualises the networks of relationships found in investigations into political corruption, fraud in public
          contracts and financial flows in Brazil.
        </p>
        <p>
          Our aim is to make lengthy legal case files, reports of parliamentary committees of inquiry (CPIs) and
          investigative journalism accessible through a navigable graph. By mapping the entities — politicians, parties,
          companies, operators and schemes — users can explore how public money moved between different operations over
          time.
        </p>
      </section>

      <section className="space-y-4 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Methodology and data standards
        </h2>
        <p>
          Impartiality and factual accuracy are the foundation of our data collection. Every entity and every connection
          in the graph follows strict rules on public sourcing:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official documents</span>
            </div>
            <p className="text-xs text-slate-400">
              Public court rulings, charges brought by the Federal Prosecution Service (MPF), cases before the Supreme
              Federal Court (STF) and the Superior Court of Justice (STJ), Federal Police operations and audit reports by
              the Office of the Comptroller General (CGU) and the Federal Court of Accounts (TCU).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Established news media</span>
            </div>
            <p className="text-xs text-slate-400">
              Reporting by major news outlets (G1, Folha de S.Paulo, Estadão, UOL, CNN Brasil, BBC Brasil, Agência
              Brasil), with no partisan blogs and no unverified claims from online forums.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          Neutrality and the right of defence
        </h2>
        <p>
          Each connection shows the legal stage the matter has reached. An investigation or a charge is not a
          conviction, and the annulment of a conviction is not an acquittal. The positions of the defence and rulings
          in favour of those named are recorded with equal weight and in a neutral tone.
        </p>
        <StatusList locale="en" />
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">Contact and corrections</h2>
        <p>
          Found inaccurate information, a more recent court ruling or a broken source link? Write to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          . Requests for correction and for a right of reply are reviewed and, where well founded, applied — and every
          change of content is recorded, with the date and the reason, on the{' '}
          <Link href={localePath('en', '/correcoes')} className="text-cyan-400 hover:underline">
            corrections and updates
          </Link>{' '}
          page. Each dossier shows the date it was last reviewed.
        </p>
        <p className="text-xs text-slate-400">
          The site is written in Brazilian Portuguese; this English version is a translation. Where a translation is
          missing or is being revised, the original Portuguese text is shown.
        </p>
      </section>

    </div>
  );
}
