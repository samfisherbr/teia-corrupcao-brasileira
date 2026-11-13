/**
 * Página "Política de Privacidade" — tradução para o ESPANHOL de privacy.pt.tsx (o original).
 */
import React from 'react';
import { Lock, Eye, Cookie, FileText } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';

// Classe reaproveitada nos links externos desta página.
const LINK_CLASS = 'text-cyan-400 underline hover:text-cyan-300';

export default function PrivacyEs() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <p className="text-xs text-slate-400">
        Este texto es una traducción del original en portugués, que se ofrece para facilitar la lectura. En caso de
        discrepancia entre ambas versiones, prevalece la{' '}
        <a href={localePath('pt', '/privacy')} hrefLang="pt-BR" className="text-cyan-400 underline">
          versión en portugués
        </a>
        .
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          1. Visión general y compromiso
        </h2>
        <p>
          En <strong>{SITE_NAME}</strong>, accesible en https://{SITE_DOMAIN}, la privacidad de los visitantes es una
          prioridad. Este documento describe qué información se recoge y se registra y cómo se utiliza, de conformidad
          con la Ley General de Protección de Datos Personales de Brasil (LGPD, Ley n.º 13.709/2018).
        </p>
        <p>
          El sitio no exige registro ni inicio de sesión. Si tiene dudas o necesita más información sobre esta
          política, póngase en contacto con nosotros.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Cookie className="w-4 h-4 text-cyan-400" />
          2. Cookies y publicidad de terceros (Google AdSense)
        </h2>
        <p>
          {SITE_NAME} puede utilizar cookies para guardar preferencias de navegación y para mostrar anuncios. Las
          cookies de publicidad las establecen terceros, como se indica a continuación.
        </p>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100 uppercase tracking-wider font-mono text-[11px]">
            Google y proveedores externos:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Google, como proveedor externo, utiliza cookies para mostrar anuncios a los visitantes en función de sus
              visitas a {SITE_DOMAIN} y a otros sitios de internet.
            </li>
            <li>
              Las cookies de publicidad permiten a Google y a sus socios mostrar anuncios basados en las visitas del
              usuario a este y a otros sitios.
            </li>
            <li>
              Es posible desactivar la publicidad personalizada en la{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                Configuración de anuncios de Google
              </a>
              . También es posible rechazar el uso de cookies de proveedores externos para publicidad personalizada en{' '}
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
          3. Registros de acceso (logs)
        </h2>
        <p>
          Como en prácticamente todo servicio de alojamiento, el proveedor del sitio (Cloudflare) registra
          automáticamente datos técnicos de acceso: dirección IP, tipo de navegador, proveedor de internet, fecha y
          hora, y páginas de origen y de salida. Esta información se utiliza con fines de seguridad, administración del
          sitio y estadísticas agregadas de uso, y no se asocia a ninguna identificación personal.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          4. Políticas de privacidad de terceros
        </h2>
        <p>
          Esta política no se aplica a los anunciantes ni a los sitios externos a los que remite el grafo (como
          portales de noticias y tribunales). Recomendamos consultar las políticas de privacidad de esos servicios.
        </p>
        <p>
          Puede desactivar las cookies en la configuración de su navegador. Las instrucciones específicas están
          disponibles en el sitio web de cada navegador.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">5. Sus derechos según la LGPD</h2>
        <p>
          De conformidad con el artículo 18 de la LGPD, usted puede solicitar en cualquier momento:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
          <li><strong>Confirmación y acceso</strong>: saber si tratamos datos suyos y obtener una copia de ellos.</li>
          <li><strong>Rectificación</strong>: corregir datos incompletos, inexactos o desactualizados.</li>
          <li><strong>Anonimización, bloqueo o supresión</strong>: de datos innecesarios, excesivos o tratados de forma contraria a la ley.</li>
          <li><strong>Información sobre la comunicación de datos</strong>: saber con qué entidades se comparten sus datos.</li>
          <li><strong>Revocación del consentimiento</strong>: cuando el tratamiento se base en él.</li>
        </ul>
        <p className="text-xs text-slate-400">
          También es posible presentar una reclamación ante la Autoridad Nacional de Protección de Datos de Brasil
          (ANPD).
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">6. Contacto</h2>
        <p>
          Las dudas, sugerencias o solicitudes relacionadas con esta política pueden enviarse a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

    </div>
  );
}
