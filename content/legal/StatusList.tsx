/**
 * Lista dos status jurídicos com a cor de cada um (página Sobre). Gerada a
 * partir de STATUS_STYLE e dos nomes em messages/, para nunca ficar diferente
 * da legenda do grafo.
 */
import React from 'react';
import { STATUS_STYLE } from '@/lib/graphConfig';
import { getMessages } from '@/messages';
import type { Locale } from '@/lib/i18n';
import type { LinkStatus } from '@/types/graph';

export default function StatusList({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => (
        <li key={key} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_STYLE[key].color }} />
          {t.status[key]}
        </li>
      ))}
    </ul>
  );
}
