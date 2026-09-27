import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildCatalog, checkCatalog } from "../tools/catalog.js";

const LANGUAGES = ["en", "de"];

// A catalog in a fresh directory: { namespace: { language: messages or raw file text } }.
function plant(files: Record<string, Record<string, Record<string, unknown> | string>>): string {
  const dir = mkdtempSync(join(tmpdir(), "catalog-"));
  for (const [namespace, languages] of Object.entries(files)) {
    mkdirSync(join(dir, namespace));
    for (const [file, content] of Object.entries(languages)) {
      writeFileSync(join(dir, namespace, file), typeof content === "string" ? content : JSON.stringify(content));
    }
  }
  return dir;
}

const clean = {
  "en.json": { title: "Sign in", welcome: "Hello {name}" },
  "de.json": { title: "Anmelden", welcome: "Hallo {name}" },
};

test("a complete catalog passes, and the report says how much it covered", () => {
  const report = checkCatalog(plant({ auth: clean, post: clean }), LANGUAGES, "en");
  assert.deepEqual(report.problems, []);
  assert.deepEqual(report.namespaces, ["auth", "post"]);
  assert.equal(report.keys, 4);
});

test("a key missing in one language fails", () => {
  const report = checkCatalog(plant({ auth: { ...clean, "de.json": { title: "Anmelden" } } }), LANGUAGES, "en");
  assert.deepEqual(report.problems, ['auth/de: "welcome" is missing']);
});

test("a key that the reference language lacks fails", () => {
  const report = checkCatalog(plant({ auth: { ...clean, "de.json": { ...clean["de.json"], extra: "x" } } }), LANGUAGES, "en");
  assert.deepEqual(report.problems, ['auth/de: "extra" is not in en']);
});

test("a message naming other placeholders than the reference fails", () => {
  const report = checkCatalog(
    plant({ auth: { ...clean, "de.json": { title: "Anmelden", welcome: "Hallo {user}" } } }),
    LANGUAGES,
    "en",
  );
  assert.deepEqual(report.problems, ['auth/de: "welcome" names {user}, en names {name}']);
});

test("a missing language file, a foreign file and a non-string message fail", () => {
  const dir = plant({ auth: { "en.json": { title: "Sign in", count: 3 }, "xx.json": {} } });
  const { problems } = checkCatalog(dir, LANGUAGES, "en");
  assert.ok(problems.includes("auth/xx.json: not a supported language (en, de)"), problems.join("\n"));
  assert.ok(problems.includes("auth: de.json is missing"), problems.join("\n"));
  assert.ok(problems.some((p) => p.endsWith('"count" is not a string')), problems.join("\n"));
});

test("a file that is not JSON and a namespace with an unusable name fail", () => {
  const { problems } = checkCatalog(plant({ Auth_UI: { "en.json": "{ not json", "de.json": {} } }), LANGUAGES, "en");
  assert.ok(problems.includes("Auth_UI: a namespace name is lowercase letters, digits and dashes"), problems.join("\n"));
  assert.ok(problems.some((p) => p.includes("not valid JSON")), problems.join("\n"));
});

test("the built module exports the namespace's bundle", async () => {
  const out = mkdtempSync(join(tmpdir(), "catalog-out-"));
  assert.deepEqual(buildCatalog(plant({ auth: clean }), out, LANGUAGES), ["auth"]);
  const built = (await import(pathToFileURL(join(out, "auth.js")).href)) as { default: unknown };
  assert.deepEqual(built.default, { en: clean["en.json"], de: clean["de.json"] });
});
