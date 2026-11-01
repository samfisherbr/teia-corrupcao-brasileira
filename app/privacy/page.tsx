import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Teia da Corrupção',
  description: 'Privacy Policy and Cookie Usage Guidelines for Teia da Corrupção Corruption Visualizer.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 1, 2026';
  const contactEmail = 'samfisherbr@gmail.com'; // Replace with your actual email
  const domainName = 'teiadacorrupcao.io'; // Replace with your domai

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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Privacy Policy</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">Last Updated: {lastUpdated}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              1. Overview & Commitment
            </h2>
            <p>
              At <strong>Teia da Corrupção</strong> ({domainName}), accessible from https://{domainName}, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Teia da Corrupção and how we use it.
            </p>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Cookie className="w-4 h-4 text-cyan-400" />
              2. Cookies & Third-Party Advertising (Google AdSense)
            </h2>
            <p>
              Teia da Corrupção uses cookies to store information about visitors&apos; preferences, the pages on the website that the visitor accessed or visited, and to optimize the user experience by customizing our web page content based on visitors&apos; browser type or other information.
            </p>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 uppercase tracking-wider font-mono text-[11px]">
                Google DoubleClick DART Cookie & Third-Party Vendors:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to {domainName} and other sites on the internet.
                </li>
                <li>
                  Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.
                </li>
                <li>
                  Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300"
                  >
                    Google Ads Settings
                  </a>
                  . Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300"
                  >
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
              3. Log Files & Analytics
            </h2>
            <p>
              Teia da Corrupção follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services&apos; analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              4. Third-Party Privacy Policies
            </h2>
            <p>
              Teia da Corrupção&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
            </p>
            <p>
              You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">5. GDPR & LGPD Data Protection Rights</h2>
            <p>
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-100">6. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at{' '}
              <a href={`mailto:${contactEmail}`} className="text-cyan-400 underline">
                {contactEmail}
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}