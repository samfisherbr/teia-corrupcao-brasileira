'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#060a12] border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
      <div className="font-mono">
        &copy; {new Date().getFullYear()} CORRWEB. All rights reserved.
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/about" className="hover:text-cyan-400 transition-colors">
          About Us
        </Link>
        <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-cyan-400 transition-colors">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}