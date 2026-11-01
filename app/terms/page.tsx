import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, FileCode, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Teia da Corrupção',
  description: 'Terms of Service and Conditions of Use for Teia da Corrupção Corruption Visualizer.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'November 1, 2026';
  const domainName = 'teiadacorrupcao.io';

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
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Terms of Service</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">Last Updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing and using <strong>Teia da Corrupção</strong> ({domainName}), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this website.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              2. Nature of Platform & Public Data
            </h2>
            <p>
              Teia da Corrupção is an open-source, investigative network visualization tool designed for informational, educational, and analytical purposes. All relational network data, entity summaries, court references, and public contract links presented within the visualizer are compiled from publicly available official documents, government portals (such as MPF, STF, CGU, TCU, CPI reports), and reputable media outlets.
            </p>
            <p>
              While we strive for factual accuracy and neutrality, Teia da Corrupção does not generate legal accusations independently. Information is provided on an &quot;as-is&quot; basis without warranties of completeness or real-time legal status changes.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              3. Third-Party Links & Advertisements
            </h2>
            <p>
              This website may contain links to third-party websites or services (including news sources, official PDF court rulings, and third-party advertising services like Google AdSense) that are not owned or controlled by Teia da Corrupção.
            </p>
            <p>
              Teia da Corrupção has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or ad providers. You acknowledge and agree that Teia da Corrupção shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with the use of any such content or services.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              4. Disclaimer & Limitation of Liability
            </h2>
            <p>
              In no event shall Teia da Corrupção, its maintainers, or contributors be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your access to, or use of, this platform or any information provided herein.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">5. Modifications to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms of Service at any time at our sole discretion. Your continued use of the website following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}