/**
 * Página "Termos de Uso" — tradução para o ESPANHOL de terms.pt.tsx (o original).
 */
import React from 'react';
import Link from 'next/link';
import { ShieldAlert, FileCode, ExternalLink } from 'lucide-react';
import { SITE_NAME, SITE_DOMAIN, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';

export default function TermsEs() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <p className="text-xs text-slate-400">
        Este texto es una traducción del original en portugués, que se ofrece para facilitar la lectura. En caso de
        discrepancia entre ambas versiones, prevalece la{' '}
        <a href={localePath('pt', '/terms')} hrefLang="pt-BR" className="text-cyan-400 underline">
          versión en portugués
        </a>
        .
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">1. Aceptación de los términos</h2>
        <p>
          Al acceder a <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}) y utilizarlo, usted declara que ha leído estos
          términos y que los acepta. Si no está de acuerdo, no utilice el sitio.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          2. Naturaleza de la plataforma y de los datos
        </h2>
        <p>
          {SITE_NAME} es una herramienta de visualización de redes de carácter informativo, educativo y analítico. Los
          datos de entidades, resúmenes, referencias judiciales y vínculos que se muestran se recopilan de documentos
          oficiales públicos, portales gubernamentales (como el Ministerio Público Federal (MPF), el Supremo Tribunal
          Federal (STF), el Superior Tribunal de Justicia (STJ), la Contraloría General de la Unión (CGU), el Tribunal
          de Cuentas de la Unión (TCU) y los informes de las comisiones parlamentarias de investigación (CPI)) y medios
          de comunicación de referencia.
        </p>
        <p>
          Aunque buscamos la precisión y la neutralidad, {SITE_NAME} no formula acusaciones propias: se limita a
          organizar información ya publicada, indicando la fuente de cada vínculo y la fase procesal correspondiente.
          La información se ofrece &quot;tal cual&quot;, sin garantía de exhaustividad ni de actualización en tiempo
          real de las resoluciones judiciales.
        </p>
        <p>
          Una investigación, una acusación o una condena recurrible no significan culpabilidad definitiva. Prevalece la
          presunción de inocencia hasta que la sentencia sea firme.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          3. Enlaces externos y anuncios
        </h2>
        <p>
          El sitio contiene enlaces a sitios y servicios de terceros (portales de noticias, resoluciones judiciales en
          PDF y servicios de publicidad como Google AdSense) que no pertenecen a {SITE_NAME} ni están bajo su control.
        </p>
        <p>
          {SITE_NAME} no tiene control sobre el contenido, las políticas de privacidad ni las prácticas de esos sitios
          y anunciantes, y no se responsabiliza de los daños o pérdidas derivados del uso de esos contenidos o
          servicios.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          4. Exención y limitación de responsabilidad
        </h2>
        <p>
          En la máxima medida permitida por la legislación brasileña, {SITE_NAME}, sus responsables y colaboradores no
          se responsabilizan de los daños directos, indirectos, incidentales o consecuentes derivados del acceso a la
          plataforma o de su uso, ni de la información disponible en ella.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">5. Correcciones y derecho de réplica</h2>
        <p>
          Las personas e instituciones citadas pueden solicitar la corrección de información o la inclusión de su
          posición escribiendo a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          , indicando el vínculo en cuestión y la fuente en la que se basa la solicitud. Las correcciones aplicadas
          quedan registradas, con la fecha y el motivo, en{' '}
          <Link href={localePath('es', '/correcoes')} className="text-cyan-400 hover:underline">
            Correcciones y actualizaciones
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">6. Modificación de estos términos</h2>
        <p>
          Estos términos pueden modificarse en cualquier momento. La fecha de actualización que figura al principio
          indica la versión vigente, y el uso continuado del sitio después de una modificación supone la aceptación de
          la nueva versión.
        </p>
      </section>

    </div>
  );
}
