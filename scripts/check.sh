#!/usr/bin/env bash
# The fixed check of this repository: the translation files, and the tests that plant each defect the
# check must catch. The pre-push hook runs it before anything leaves the machine; CI runs it on every push.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/check-translations.mjs
node --test scripts/check-translations.test.mjs
