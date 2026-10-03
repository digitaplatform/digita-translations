import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkTranslations } from './check-translations.mjs';

// A translations/ folder in a fresh directory: { folder: { file: messages or raw text } }.
function plant(tree) {
  const dir = mkdtempSync(join(tmpdir(), 'translations-'));
  for (const [folder, files] of Object.entries(tree)) {
    mkdirSync(join(dir, folder));
    for (const [file, content] of Object.entries(files)) {
      writeFileSync(join(dir, folder, file), typeof content === 'string' ? content : JSON.stringify(content));
    }
  }
  return dir;
}

const clean = {
  'en.json': { title: 'Sign in', welcome: 'Hello {name}' },
  'de.json': { title: 'Anmelden', welcome: 'Hallo {name}' },
};

test('complete folders pass, and the report says how much it covered', () => {
  const report = checkTranslations(plant({ 'digita-auth-frontend': clean, 'digita-post': clean }));
  assert.deepEqual(report.problems, []);
  assert.deepEqual(report.folders, ['digita-auth-frontend', 'digita-post']);
  assert.deepEqual(report.languages, ['de', 'en']);
  assert.equal(report.keys, 4);
});

test('regional language files are checked for keys and placeholders', () => {
  const files = { ...clean, 'es-MX.json': { title: 'Iniciar sesión', welcome: 'Hola {name}' } };
  const good = checkTranslations(plant({ 'digita-post': files }));
  assert.deepEqual(good.problems, []);
  assert.deepEqual(good.languages, ['de', 'en', 'es-MX']);
  const bad = checkTranslations(plant({
    'digita-post': { ...files, 'es-MX.json': { welcome: 'Hola {user}', extra: 'x' } },
  }));
  assert.deepEqual(bad.problems, [
    'digita-post/es-MX: "title" is missing',
    'digita-post/es-MX: "welcome" names {user}, en names {name}',
    'digita-post/es-MX: "extra" is not in en',
  ]);
});

test('a regional language present in one component is required in the others', () => {
  const report = checkTranslations(plant({
    'digita-post': clean,
    'digita-auth-frontend': { ...clean, 'es-MX.json': clean['en.json'] },
  }));
  assert.deepEqual(report.problems, ['digita-post: es-MX.json is missing']);
});

test('malformed or noncanonical regional filenames are rejected', () => {
  const files = ['es-mx.json', 'es_MX.json', 'es-MEX.json', 'es-MX-extra.json'];
  const report = checkTranslations(plant({
    'digita-post': { ...clean, ...Object.fromEntries(files.map((file) => [file, clean['en.json']])) },
  }));
  assert.equal(report.problems.length, files.length);
  for (const file of files) {
    assert.ok(report.problems.includes(`digita-post/${file}: only <language>.json files belong in a folder`));
  }
});

test('a key missing in a language fails, and so does a key the reference lacks', () => {
  const report = checkTranslations(plant({ 'digita-post': { ...clean, 'de.json': { title: 'Anmelden', extra: 'x' } } }));
  assert.deepEqual(report.problems, ['digita-post/de: "welcome" is missing', 'digita-post/de: "extra" is not in en']);
});

test('other placeholders than the reference fail', () => {
  const report = checkTranslations(plant({ 'digita-post': { ...clean, 'de.json': { title: 'Anmelden', welcome: 'Hallo {user}' } } }));
  assert.deepEqual(report.problems, ['digita-post/de: "welcome" names {user}, en names {name}']);
});

test('an empty message fails', () => {
  const report = checkTranslations(plant({ 'digita-post': { ...clean, 'de.json': { title: ' ', welcome: 'Hallo {name}' } } }));
  assert.ok(report.problems.some((p) => p.endsWith('"title" is empty')), report.problems.join('\n'));
});

test('a folder without a language another folder has fails', () => {
  const report = checkTranslations(plant({ 'digita-post': clean, 'digita-auth-frontend': { 'en.json': clean['en.json'] } }));
  assert.deepEqual(report.problems, ['digita-auth-frontend: de.json is missing']);
});

test('a stray file, a folder not named after a build and invalid JSON fail', () => {
  const dir = plant({ 'digita-post': { ...clean, 'notes.txt': 'x' }, auth: clean, 'digita-report-frontend': { 'en.json': '{ no', 'de.json': {} } });
  writeFileSync(join(dir, 'README.md'), 'x');
  const { problems } = checkTranslations(dir);
  for (const expected of [
    'digita-post/notes.txt: only <language>.json files belong in a folder',
    'auth: a folder is named after a build, digita-...',
    'README.md: only folders belong in translations/',
  ]) {
    assert.ok(problems.includes(expected), `${expected}\n---\n${problems.join('\n')}`);
  }
  assert.ok(problems.some((p) => p.includes('not valid JSON')), problems.join('\n'));
});

test('a folder over 1 MiB fails', () => {
  const big = Object.fromEntries(Array.from({ length: 12000 }, (_, i) => [`k${i}`, 'x'.repeat(100)]));
  const report = checkTranslations(plant({ 'digita-post': { 'en.json': big, 'de.json': big } }));
  assert.ok(report.problems.some((p) => p.startsWith('digita-post: ') && p.includes('bytes, more than')), report.problems.join('\n'));
});
