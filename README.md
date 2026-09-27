# digita-translator

The built-in texts of the Digita platform and its services, in every supported language, and the
translator that reads them. It is published as `@digitaplatform/translator` to GitHub Packages.

The texts of the apps (the `locales/` of erp and buildproject, entity labels, data translations)
are not here. They belong to each app and live in the engine's `Translation` collection, where a
tenant can change them.

## Layout

- `catalog/<namespace>/<language>.json`: a flat object of key to message, one namespace per
  consumer (for example `auth`, `post`, `report`). A message may name placeholders as `{name}`.
- `src/languages.ts`: `SUPPORTED_LANGUAGES`, the languages every namespace carries in full, and
  `FALLBACK_LANGUAGE`, against which every other language is checked.
- `src/translator.ts`: `createTranslator`, which resolves a key in a language, falls back to the
  fallback language and then to the key itself, and fills the placeholders.
- `tools/`: the catalog check and the build that turns each namespace into an ES module.

## Use

A consumer maps the scope to GitHub Packages (this repository's `.npmrc`) and provides a token
with `read:packages` out of band, for example
`pnpm config set '//npm.pkg.github.com/:_authToken' "$(gh auth token)"`.

```ts
import { createTranslator, FALLBACK_LANGUAGE } from "@digitaplatform/translator";
import auth from "@digitaplatform/translator/auth";

const i18n = createTranslator(auth, FALLBACK_LANGUAGE);
i18n.t("login.title", undefined, user.language);
i18n.t("welcome", { name: user.name }, i18n.resolveLocale(request.headers["accept-language"]));
```

## Change the texts

- A new text: add its key to every language file of the namespace.
- A new namespace: a folder with one file for every supported language.
- A new language: add it to `SUPPORTED_LANGUAGES` and add its file to every namespace.

`scripts/check.sh` (or `scripts/check.ps1`) installs from the lockfile, builds and runs the
tests. The build fails when a namespace lacks a supported language, when a key is missing in or
foreign to a language, or when a message names other placeholders than the fallback language.

## Release

Raise `version` in `package.json` and push to master. The CI publishes every version that
GitHub Packages does not carry yet.
