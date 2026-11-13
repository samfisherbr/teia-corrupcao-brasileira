/**
 * Página "Sobre" — tradução para o ESPANHOL de about.pt.tsx (o original).
 */
import React from 'react';
import Link from 'next/link';
import { Info, Database, CheckCircle2, Scale } from 'lucide-react';
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/site';
import { localePath } from '@/lib/i18n';
import StatusList from './StatusList';

export default function AboutEs() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Misión y propósito
        </h2>
        <p>
          <strong>{SITE_NAME}</strong> («Red de la Corrupción») es una plataforma interactiva que registra y visualiza
          las redes de relaciones presentes en las investigaciones de corrupción política, fraudes en contratos públicos
          y flujos financieros en Brasil.
        </p>
        <p>
          Nuestro objetivo es hacer accesibles, mediante un grafo navegable, extensos sumarios judiciales, informes de
          las comisiones parlamentarias de investigación (CPI) y reportajes de investigación. Al registrar las entidades
          —políticos, partidos, empresas, operadores y tramas—, el usuario puede explorar cómo circularon los recursos
          públicos entre distintas operaciones a lo largo del tiempo.
        </p>
      </section>

      <section className="space-y-4 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Metodología y rigor de los datos
        </h2>
        <p>
          La imparcialidad y la precisión de los hechos son la base de la recogida de datos. Cada entidad y cada
          conexión del grafo sigue reglas estrictas de fuente pública:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Documentos oficiales</span>
            </div>
            <p className="text-xs text-slate-400">
              Resoluciones judiciales públicas, acusaciones del Ministerio Público Federal (MPF), procesos ante el
              Supremo Tribunal Federal (STF) y el Superior Tribunal de Justicia (STJ), operaciones de la Policía Federal
              e informes de auditoría de la Contraloría General de la Unión (CGU) y del Tribunal de Cuentas de la Unión
              (TCU).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Prensa de referencia</span>
            </div>
            <p className="text-xs text-slate-400">
              Reportajes de medios de gran difusión (G1, Folha de S.Paulo, Estadão, UOL, CNN Brasil, BBC Brasil, Agência
              Brasil), sin blogs partidistas ni afirmaciones no verificadas de foros.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          Neutralidad y derecho de defensa
        </h2>
        <p>
          Cada conexión muestra la fase judicial en la que se encuentra el hecho. Una investigación o una acusación no
          equivale a una condena, y la anulación de una condena no equivale a una absolución. Las posiciones de la
          defensa y las resoluciones favorables a las personas citadas se registran con el mismo peso y en tono neutro.
        </p>
        <StatusList locale="es" />
      </section>

      <section className="space-y-3 border-t border-slate-800/80 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">Contacto y correcciones</h2>
        <p>
          ¿Ha encontrado una información imprecisa, una resolución judicial más reciente o un enlace de fuente roto?
          Escriba a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
            {CONTACT_EMAIL}
          </a>
          . Las solicitudes de corrección y de derecho de réplica se analizan y, cuando proceden, se aplican; y todo
          cambio de contenido queda registrado, con la fecha y el motivo, en la página de{' '}
          <Link href={localePath('es', '/correcoes')} className="text-cyan-400 hover:underline">
            correcciones y actualizaciones
          </Link>
          . Cada dosier muestra la fecha de la última revisión.
        </p>
        <p className="text-xs text-slate-400">
          El sitio se redacta en portugués de Brasil; esta versión en español es una traducción. Cuando falta una
          traducción o está en revisión, se muestra el texto original en portugués.
        </p>
      </section>

    </div>
  );
}
