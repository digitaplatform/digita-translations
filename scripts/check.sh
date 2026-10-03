#!/usr/bin/env bash
# The local gate checks translation files. GitHub Actions also runs the checker regression suite.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/check-translations.mjs
echo "not run locally: scripts/check-translations.test.mjs (runs in GitHub Actions on every push)"

echo "check: OK — local checks green; tests not run locally"
