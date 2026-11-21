/**
 * Países onde o site só pede anúncios depois do consentimento do visitante:
 * Espaço Econômico Europeu (UE + Islândia, Liechtenstein, Noruega), Reino
 * Unido e Suíça — as regiões da mensagem de consentimento do Google
 * (AdSense → Privacidade e mensagens → Regulamentações europeias).
 *
 * Usado por /api/consent-region e, através dela, por components/AdSenseLoader.tsx.
 * País desconhecido (sem geolocalização, Tor = "T1", "XX") conta como região
 * de consentimento: na dúvida, nenhum anúncio antes da escolha.
 */
export const CONSENT_COUNTRIES: ReadonlySet<string> = new Set([
  // União Europeia
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Demais países do EEE
  'IS', 'LI', 'NO',
  // Reino Unido e Suíça
  'GB', 'CH',
]);

/** true quando o visitante deste país (código ISO de 2 letras) precisa consentir antes dos anúncios. */
export function consentRequiredFor(country: string | null | undefined): boolean {
  const code = country?.trim().toUpperCase();
  if (!code || code.length !== 2 || code === 'XX' || code === 'T1') return true;
  return CONSENT_COUNTRIES.has(code);
}
