import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from "../src/languages.js";

// A namespace is `catalog/<namespace>/<language>.json`: a flat object of key to message.
type Messages = Record<string, string>;

// The placeholder syntax createTranslator substitutes.
const PLACEHOLDER = /\{(\w+)\}/g;
// A namespace name becomes a module file and the package subpath `@digitaplatform/translator/<name>`.
const NAMESPACE_NAME = /^[a-z][a-z0-9-]*$/;

export interface CatalogReport {
  namespaces: string[];
  /** The keys of the reference language, summed over every namespace. */
  keys: number;
  problems: string[];
}

export function listNamespaces(catalogDir: string): string[] {
  if (!existsSync(catalogDir)) return [];
  return readdirSync(catalogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readMessages(file: string, problems: string[]): Messages | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    problems.push(`${file}: not valid JSON (${(err as Error).message})`);
    return undefined;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    problems.push(`${file}: not an object of key to message`);
    return undefined;
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== "string") problems.push(`${file}: "${key}" is not a string`);
  }
  return parsed as Messages;
}

function placeholders(message: string): string {
  return [...new Set([...message.matchAll(PLACEHOLDER)].map((match) => match[1]))].sort().join(", ");
}

/**
 * Every namespace carries every language, with the reference language's keys and nothing else,
 * and each message names the same placeholders in every language.
 */
export function checkCatalog(
  catalogDir: string,
  languages: readonly string[] = SUPPORTED_LANGUAGES,
  reference: string = FALLBACK_LANGUAGE,
): CatalogReport {
  const problems: string[] = [];
  const namespaces = listNamespaces(catalogDir);
  let keys = 0;
  for (const namespace of namespaces) {
    if (!NAMESPACE_NAME.test(namespace)) problems.push(`${namespace}: a namespace name is lowercase letters, digits and dashes`);
    const dir = join(catalogDir, namespace);
    for (const file of readdirSync(dir)) {
      const language = file.replace(/\.json$/, "");
      if (!file.endsWith(".json") || !languages.includes(language)) {
        problems.push(`${namespace}/${file}: not a supported language (${languages.join(", ")})`);
      }
    }
    const byLanguage = new Map<string, Messages>();
    for (const language of languages) {
      const file = join(dir, `${language}.json`);
      if (!existsSync(file)) {
        problems.push(`${namespace}: ${language}.json is missing`);
        continue;
      }
      const messages = readMessages(file, problems);
      if (messages) byLanguage.set(language, messages);
    }
    const base = byLanguage.get(reference);
    if (!base) continue;
    keys += Object.keys(base).length;
    for (const [language, messages] of byLanguage) {
      if (language === reference) continue;
      for (const [key, message] of Object.entries(base)) {
        const translated = messages[key];
        if (translated === undefined) {
          problems.push(`${namespace}/${language}: "${key}" is missing`);
        } else if (typeof translated === "string" && placeholders(translated) !== placeholders(message)) {
          problems.push(
            `${namespace}/${language}: "${key}" names {${placeholders(translated)}}, ${reference} names {${placeholders(message)}}`,
          );
        }
      }
      for (const key of Object.keys(messages)) {
        if (!(key in base)) problems.push(`${namespace}/${language}: "${key}" is not in ${reference}`);
      }
    }
  }
  return { namespaces, keys, problems };
}

/** Writes each namespace as `<outDir>/<namespace>.js`, whose default export is its LocaleBundle. */
export function buildCatalog(
  catalogDir: string,
  outDir: string,
  languages: readonly string[] = SUPPORTED_LANGUAGES,
): string[] {
  mkdirSync(outDir, { recursive: true });
  const namespaces = listNamespaces(catalogDir);
  for (const namespace of namespaces) {
    const bundle: Record<string, Messages> = {};
    for (const language of languages) {
      bundle[language] = JSON.parse(readFileSync(join(catalogDir, namespace, `${language}.json`), "utf8")) as Messages;
    }
    writeFileSync(join(outDir, `${namespace}.js`), `export default ${JSON.stringify(bundle)};\n`);
    writeFileSync(
      join(outDir, `${namespace}.d.ts`),
      'import type { LocaleBundle } from "../src/translator.js";\ndeclare const bundle: LocaleBundle;\nexport default bundle;\n',
    );
  }
  return namespaces;
}
