# digita-translations

The texts of the Digita builds, in every language, as plain JSON files. This repository is a source:
it has no package and no release. Each stage of the platform pins one commit of `master`, and an init
container copies that commit's files into the pods. A new text reaches a stage when its pin moves.

The texts of the apps (the `locales/` of erp and buildproject, entity labels, data translations) are
not here. They belong to each app and live in the engine's `Translation` collection, where a tenant
can change them.

## Layout

`translations/<build>/<language>.json` is a flat object of key to message. A message may name
placeholders as `{name}`.

- The folder is named after the build that reads it, as its repository's `deploy/platform.yaml` names
  the build: `digita-auth-frontend`, `digita-auth-backend`, `digita-post`, `digita-report-frontend`,
  `digita-engine`, `digita-app`, `digita-web`.
- Every folder carries the same languages: en, de, es, fr, it and tr. `en` is the reference, and every
  other language has exactly its keys.

## Who wrote the texts

- en and de come from the builds' earlier locale files.
- es, fr, it and tr of the auth, post and report folders were machine-made in September 2026 and no
  person has read them yet.
- digita-engine, digita-app and digita-web take every language from the platform's earlier locale
  files.
- The digita-web texts of the contact sheet, the product family menu, the design band and the status
  labels (the `contact*`, `topic*`, `family*`, `design*` and `status*` keys) were written in en and de
  in September 2026; their es, fr, it and tr were machine-made then and no person has read them yet. Only fr and it of `field_invalid_time` and `field_invalid_duration` in digita-engine were
  machine-made, in September 2026.

The check proves the shape of the files (keys, languages, placeholders), never their meaning.

## Change the texts

- A new text: add its key to every language file of the folder.
- A new build: a folder with one file for every language.
- A new language: add its file to every folder.

`scripts/check.sh` (or `scripts/check.ps1`) runs `scripts/check-translations.mjs` and its tests; CI runs
the same on every push. The check fails when:
- a folder lacks a language file;
- a key is missing in or foreign to a language;
- a message names other placeholders than its `en` message, or is empty;
- anything under `translations/` is not a `<language>.json` file of a build's folder;
- a folder grows past 1 MiB. Every language of a folder reaches a frontend at start, so past that size
  the frontends should load one language at a time.
