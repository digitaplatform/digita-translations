// The only code of this repository: it checks the translation files and nothing else. It needs no
// dependency, so CI and a developer run it with plain Node.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Every other language is compared with this one.
const REFERENCE = 'en';
// A folder is named after the build that reads it, as its repository's deploy/platform.yaml names it.
const FOLDER_NAME = /^digita-[a-z0-9-]+$/;
const LANGUAGE_FILE = /^([a-z]{2}(?:-[A-Z]{2})?)\.json$/;
// The placeholder syntax the translator in @digitaplatform/shared fills.
const PLACEHOLDER = /\{(\w+)\}/g;
// A frontend loads every language of its folder at start.
const MAX_FOLDER_BYTES = 1024 * 1024;

function placeholders(message) {
  return [...new Set([...message.matchAll(PLACEHOLDER)].map((m) => m[1]))].sort().join(', ');
}

function readMessages(file, problems) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    problems.push(`${file}: not valid JSON (${err.message})`);
    return undefined;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    problems.push(`${file}: not an object of key to message`);
    return undefined;
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') problems.push(`${file}: "${key}" is not a string`);
    else if (value.trim() === '') problems.push(`${file}: "${key}" is empty`);
  }
  return parsed;
}

/**
 * Checks `dir` (the repository's translations/ folder). Every folder carries the same language files,
 * every language the reference language's keys and nothing else, every message the same placeholders,
 * and nothing under translations/ is other than a language file of a folder.
 */
export function checkTranslations(dir) {
  const problems = [];
  if (!existsSync(dir)) return { folders: [], languages: [], keys: 0, problems: [`${dir}: missing`] };

  const folders = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) problems.push(`${entry.name}: only folders belong in translations/`);
    else if (!FOLDER_NAME.test(entry.name)) problems.push(`${entry.name}: a folder is named after a build, digita-...`);
    else folders.push(entry.name);
  }
  folders.sort();

  const filesOf = new Map();
  const languages = new Set();
  for (const folder of folders) {
    const files = [];
    let bytes = 0;
    for (const entry of readdirSync(join(dir, folder), { withFileTypes: true })) {
      const match = LANGUAGE_FILE.exec(entry.name);
      if (!entry.isFile() || !match) {
        problems.push(`${folder}/${entry.name}: only <language>.json files belong in a folder`);
        continue;
      }
      files.push(match[1]);
      languages.add(match[1]);
      bytes += statSync(join(dir, folder, entry.name)).size;
    }
    if (bytes > MAX_FOLDER_BYTES) problems.push(`${folder}: ${bytes} bytes, more than ${MAX_FOLDER_BYTES}`);
    filesOf.set(folder, files);
  }
  if (folders.length > 0 && !languages.has(REFERENCE)) problems.push(`no folder has ${REFERENCE}.json`);

  let keys = 0;
  for (const folder of folders) {
    const present = filesOf.get(folder);
    for (const language of [...languages].sort()) {
      if (!present.includes(language)) problems.push(`${folder}: ${language}.json is missing`);
    }
    const byLanguage = new Map();
    for (const language of present) {
      const messages = readMessages(join(dir, folder, `${language}.json`), problems);
      if (messages) byLanguage.set(language, messages);
    }
    const base = byLanguage.get(REFERENCE);
    if (!base) continue;
    keys += Object.keys(base).length;
    for (const [language, messages] of byLanguage) {
      if (language === REFERENCE) continue;
      for (const [key, message] of Object.entries(base)) {
        const translated = messages[key];
        if (translated === undefined) problems.push(`${folder}/${language}: "${key}" is missing`);
        else if (typeof translated === 'string' && typeof message === 'string' && placeholders(translated) !== placeholders(message)) {
          problems.push(`${folder}/${language}: "${key}" names {${placeholders(translated)}}, ${REFERENCE} names {${placeholders(message)}}`);
        }
      }
      for (const key of Object.keys(messages)) {
        if (!(key in base)) problems.push(`${folder}/${language}: "${key}" is not in ${REFERENCE}`);
      }
    }
  }
  return { folders, languages: [...languages].sort(), keys, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = checkTranslations(fileURLToPath(new URL('../translations', import.meta.url)));
  for (const problem of report.problems) console.error(problem);
  console.log(
    `translations: ${report.folders.length} folder(s), ${report.keys} key(s) in ${REFERENCE}, ` +
      `${report.languages.length} languages (${report.languages.join(', ')}): ${report.problems.length} problem(s)`,
  );
  process.exit(report.problems.length === 0 ? 0 : 1);
}
