/**
 * Página "Política de Privacidade" — tradução para o INGLÊS de privacy.pt.tsx (o original).
 */
import React from 'react';
import { Lock, Eye, Cookie, FileText } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';

// Classe reaproveitada nos links externos desta página.
const LINK_CLASS = 'text-cyan-400 underline hover:text-cyan-300';

export default function PrivacyEn() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <p className="text-xs text-slate-400">
        This is a translation of the Portuguese original, provided for convenience. If the two versions differ, the{' '}
        <a href={localePath('pt', '/privacy')} hrefLang="pt-BR" className="text-cyan-400 underline">
          Portuguese version
        </a>{' '}
        prevails.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          1. Overview and commitment
        </h2>
        <p>
          At <strong>{SITE_NAME}</strong>, available at https://{SITE_DOMAIN}, visitors&apos; privacy is a priority.
          This document describes what information is collected and recorded and how it is used, in accordance with
          Brazil&apos;s General Data Protection Law (LGPD — Law No. 13,709/2018).
        </p>
        <p>
          The site requires no registration or login. If you have any questions or need more information about this
          policy, please get in touch.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Cookie className="w-4 h-4 text-cyan-400" />
          2. Cookies and third-party advertising (Google AdSense)
        </h2>
        <p>
          {SITE_NAME} may use cookies to store browsing preferences and to display advertisements. Advertising cookies
          are set by third parties, as described below.
        </p>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100 uppercase tracking-wider font-mono text-[11px]">
            Google and third-party vendors:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Google, as a third-party vendor, uses cookies to serve advertisements to visitors based on their visits to{' '}
              {SITE_DOMAIN} and to other sites on the internet.
            </li>
            <li>
              Advertising cookies enable Google and its partners to serve advertisements based on the user&apos;s visits
              to this and other sites.
            </li>
            <li>
              You can opt out of personalised advertising in{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                Google Ads Settings
              </a>
              . You can also opt out of third-party vendors&apos; use of cookies for personalised advertising at{' '}
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
          3. Access logs
        </h2>
        <p>
          As with virtually every hosting service, the site&apos;s provider (Cloudflare) automatically records
          technical access data: IP address, browser type, internet service provider, date and time, and referring and
          exit pages. This information is used for security, site administration and aggregate usage statistics, and
          is not linked to any personally identifying information.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          4. Third-party privacy policies
        </h2>
        <p>
          This policy does not apply to advertisers or to the external sites the graph links to (such as news portals
          and courts). We recommend consulting the privacy policies of those services.
        </p>
        <p>
          You can disable cookies in your browser settings. Specific instructions are available on each browser&apos;s
          website.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">5. Your rights under the LGPD</h2>
        <p>
          Under Article 18 of the LGPD, you may request at any time:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
          <li><strong>Confirmation and access</strong> — to know whether we process your data and to obtain a copy of it.</li>
          <li><strong>Correction</strong> — to have incomplete, inaccurate or out-of-date data corrected.</li>
          <li><strong>Anonymisation, blocking or erasure</strong> — of data that is unnecessary, excessive or processed in breach of the law.</li>
          <li><strong>Information about sharing</strong> — to know which entities your data is shared with.</li>
          <li><strong>Withdrawal of consent</strong> — where processing is based on it.</li>
        </ul>
        <p className="text-xs text-slate-400">
          You may also lodge a complaint with Brazil&apos;s National Data Protection Authority (ANPD).
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">6. Contact</h2>
        <p>
          Questions, suggestions or requests relating to this policy can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

    </div>
  );
}
