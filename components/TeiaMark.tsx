/**
 * Marca do site — o mesmo desenho de public/icon.svg (favicon), em React para
 * poder ser usada dentro da interface. Se mudar o desenho, mude os dois.
 * Traço em `currentColor`: a cor vem da classe de texto de quem a usa
 * (no cabeçalho, `text-cyan-500` = #06b6d4, a cor do favicon).
 */
import React from 'react';

export default function TeiaMark({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
      <polygon points="12,6 17.66,9.34 17.66,14.66 12,18 6.34,14.66 6.34,9.34" />
    </svg>
  );
}
