/**
 * Carrega SCHEME_DETAILS de data/schemeDetails.ts sem tsx nem build: o
 * TypeScript (devDependency) transpila o arquivo para JavaScript, que é
 * importado de um arquivo temporário. O arquivo só tem `import type`, que
 * desaparece na transpilação. Usado por check-timelines e check-timeline-sync.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

export const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

/** @returns {Promise<Record<string, any>>} */
export async function loadSchemeDetails() {
  const src = readFileSync(path.join(ROOT, 'data/schemeDetails.ts'), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const dir = mkdtempSync(path.join(tmpdir(), 'scheme-details-'));
  try {
    const file = path.join(dir, 'schemeDetails.mjs');
    writeFileSync(file, outputText);
    return (await import(pathToFileURL(file).href)).SCHEME_DETAILS;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Espelho de START_BASES / END_BASES / TIMELINE_DATE_RE em types/graph.ts.
export const START_BASES = ['documented_start', 'first_known_act', 'enabling_act'];
export const END_BASES = ['documented_end', 'police_investigation', 'parliamentary_inquiry', 'oversight', 'court_ruling'];
export const EXPOSED_BASES = END_BASES.filter((b) => b !== 'documented_end');
export const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
