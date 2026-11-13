/**
 * Página "Termos de Uso" — tradução para o INGLÊS de terms.pt.tsx (o original).
 */
import React from 'react';
import Link from 'next/link';
import { ShieldAlert, FileCode, ExternalLink } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';

export default function TermsEn() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <p className="text-xs text-slate-400">
        This is a translation of the Portuguese original, provided for convenience. If the two versions differ, the{' '}
        <a href={localePath('pt', '/terms')} hrefLang="pt-BR" className="text-cyan-400 underline">
          Portuguese version
        </a>{' '}
        prevails.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">1. Acceptance of the terms</h2>
        <p>
          By accessing and using <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}), you confirm that you have read and agree
          to these terms. If you do not agree, do not use the site.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          2. Nature of the platform and of the data
        </h2>
        <p>
          {SITE_NAME} is a network-visualisation tool for informational, educational and analytical purposes. The data
          on entities, summaries, court references and links shown are compiled from public official documents,
          government portals (such as the Federal Prosecution Service (MPF), the Supreme Federal Court (STF), the
          Superior Court of Justice (STJ), the Office of the Comptroller General (CGU), the Federal Court of Accounts
          (TCU) and reports of parliamentary committees of inquiry (CPIs)) and established news media.
        </p>
        <p>
          Although we strive for accuracy and neutrality, {SITE_NAME} makes no accusations of its own: it merely
          organises information that has already been published, indicating the source of each link and the
          corresponding stage of proceedings. The information is provided &quot;as is&quot;, with no guarantee that it
          is complete or that court rulings are updated in real time.
        </p>
        <p>
          An investigation, a charge or a conviction that is still open to appeal does not mean definitive guilt. The
          presumption of innocence prevails until a final, unappealable judgment.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          3. External links and advertising
        </h2>
        <p>
          The site contains links to third-party websites and services (news portals, court rulings in PDF and
          advertising services such as Google AdSense) that are neither owned nor controlled by {SITE_NAME}.
        </p>
        <p>
          {SITE_NAME} has no control over the content, privacy policies or practices of those sites and advertisers,
          and accepts no responsibility for any damage or loss arising from the use of such content or services.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          4. Disclaimer and limitation of liability
        </h2>
        <p>
          To the fullest extent permitted by Brazilian law, {SITE_NAME}, its maintainers and contributors shall not be
          liable for any direct, indirect, incidental or consequential damage arising from access to or use of the
          platform and of the information made available on it.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">5. Corrections and right of reply</h2>
        <p>
          Persons and institutions named may request the correction of information or the inclusion of their position
          by e-mailing{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          , indicating the link in question and the source supporting the request. Corrections applied are recorded,
          with the date and the reason, under{' '}
          <Link href={localePath('en', '/correcoes')} className="text-cyan-400 hover:underline">
            Corrections and updates
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">6. Changes to these terms</h2>
        <p>
          These terms may be changed at any time. The date of the last update at the top indicates the version in
          force, and continued use of the site after a change means that you accept the new version.
        </p>
      </section>

    </div>
  );
}
