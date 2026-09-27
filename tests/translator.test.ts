import { test } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../src/index.js";

const i18n = createTranslator(
  {
    en: { greeting: "Hello {name}", only_en: "Only English" },
    de: { greeting: "Hallo {name}" },
  },
  "en",
);

test("a message comes in the asked language, with its placeholders filled", () => {
  assert.equal(i18n.t("greeting", { name: "Ada" }, "de"), "Hallo Ada");
});

test("an unsupported language falls back to the fallback language", () => {
  assert.equal(i18n.t("greeting", { name: "Ada" }, "fr"), "Hello Ada");
});

test("a key missing in the asked language falls back, and an unknown key comes back as itself", () => {
  assert.equal(i18n.t("only_en", undefined, "de"), "Only English");
  assert.equal(i18n.t("no.such.key", undefined, "de"), "no.such.key");
});

test("a placeholder without a value stays visible", () => {
  assert.equal(i18n.t("greeting", {}, "en"), "Hello {name}");
});

test("Accept-Language is resolved by quality, and q=0 is never chosen", () => {
  assert.equal(i18n.resolveLocale("en;q=0.8,de;q=0.9"), "de");
  assert.equal(i18n.resolveLocale("de;q=0,en;q=0.5"), "en");
  assert.equal(i18n.resolveLocale("fr-CH,it"), "en");
  assert.equal(i18n.resolveLocale(undefined), "en");
});
