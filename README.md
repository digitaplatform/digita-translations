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

- en and de come from the builds' earlier locale files, except en and de of `security.sensitiveHint` in
  digita-auth-frontend, rewritten in September 2026, and of `demo_session_forbidden` and
  `demo_login_unavailable` in digita-auth-backend, written in September 2026; no person has read them
  yet.
- es, fr, it and tr of the auth, post and report folders were machine-made in September 2026 and no
  person has read them yet.
- digita-engine, digita-app and digita-web take every language from the platform's earlier locale
  files.
- The digita-web texts of the contact sheet, the product family menu, the design band, the status
  labels, the record form and the app list (the `contact*`, `topic*`, `family*`, `design*`, `status*`, `nav*`, `embedTitle`, `hero*`, `notFound*`, `recordForm*` and `appList*` keys) were written in en and de
  in September 2026; their es, fr, it and tr were machine-made then and no person has read them yet. Only fr and it of `field_invalid_time` and `field_invalid_duration` in digita-engine were
  machine-made, in September 2026.
- `designer.live.warning.groupBandNoLevel`, `designer.live.warning.lookupTruncated` and `list.exportMissing` in digita-report-frontend were written in en and de in October 2026;
  its es, fr, it and tr were machine-made then, and no person has read them yet.
- `action_not_available` in digita-engine was machine-made in every language in September 2026, and no
  person has read it yet.
- `ui.signature.hint` in digita-app was machine-made in every language in September 2026, and no person
  has read it yet.
- `field.BrandingSetting.default_signature` and `description.BrandingSetting.default_signature` in
  digita-engine were written in en and de in October 2026; their es, fr, it and tr were machine-made
  then, and no person has read them yet.
- `description.BrandingSetting.density` in digita-engine was written in en and de in October 2026;
  its es, fr, it and tr were machine-made then, and no person has read them yet.
- `field.BrandingSetting.web_default_signature` and `description.BrandingSetting.web_default_signature`
  in digita-engine, and the label "App Signature" of `field.BrandingSetting.default_signature`, were
  written in en and de in October 2026; their es, fr, it and tr were machine-made then, and no person
  has read them yet.
- `ui.tree.select` in digita-app was machine-made in every language in September 2026, and no person has
  read it yet.
- `ui.lang.textsNotLoaded` in digita-app was machine-made in every language in October 2026, and no
  person has read it yet.
- `ui.link.searchField` in digita-app took the words of `ui.link.searchEntity` in every language in
  October 2026; only its placeholder differs, which names a field instead of an entity.
- `ui.record.fetchFromFailed` and `ui.workflow.transitionConfirm` in digita-app were machine-made in every
  language in October 2026, and no person has read them yet.
- `ui.action.actionSucceeded` and `ui.action.actionCreated` in digita-app were machine-made in every
  language in October 2026, and no person has read them yet.
- `ui.record.pickedRowNotFound` in digita-app was machine-made in every language in October 2026, and no
  person has read it yet.
- `ui.account.sessions.loadFailed`, `ui.account.sessions.revokeFailed` and
  `ui.account.sessions.revokeOthersFailed` in digita-app were machine-made in every language in
  October 2026, and no person has read them yet.
- `ui.jobs.jobsLoadFailed`, `ui.jobs.runsLoadFailed` and `ui.jobs.tasksLoadFailed` in digita-app were
  machine-made in every language in October 2026, and no person has read them yet.
- `ui.jobs.edit` in digita-app was machine-made in every language in October 2026, and no person has
  read it yet.
- `ui.record.copy` in digita-app was machine-made in every language in October 2026, and no person has
  read it yet.
- `ui.datepicker.previousMonth`, `ui.datepicker.nextMonth`, `ui.datepicker.previousYears` and
  `ui.datepicker.nextYears` in digita-app were machine-made in every language in October 2026, and no
  person has read them yet. They replace `ui.datepicker.previous` and `ui.datepicker.next`, which
  stay until no stage runs a digita-app build that reads them.
- `ui.jobs.scheduleCleared` in digita-app was machine-made in every language in October 2026, and no
  person has read it yet.
- `ui.usermenu.empty`, `ui.usermenu.loading` and `ui.usermenu.label` in digita-app take their en from the
  texts the usermenu plugin showed before; their other languages and every language of
  `ui.usermenu.loadFailed` were machine-made in October 2026, and no person has read them yet.
- `users.status.invited`, `users.roles.appRole`, `users.roles.add` and `users.roles.appRoleHint` in
  digita-auth-frontend were machine-made in every language in October 2026, and no person has read
  them yet.
- In digita-engine, the `permission_denied_<action>` key of each action of a permission row (`select`,
  `read`, `write`, `create`, `delete`, `submit`, `cancel`, `amend`, `print`, `email`, `export`,
  `import`, `share`, `report`), `permission_denied_locked_field`, `permission_denied_locked_cell`,
  `permission_denied_locked_row`, `aggregate_bypasses_read_condition`, `lookup_bypasses_row_scope` and
  `lookup_bypasses_read_condition` were written in en and de in October 2026; their es, fr, it and tr
  were machine-made then, and no person has read them yet.

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
