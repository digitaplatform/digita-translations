#!/usr/bin/env bash
# The fixed check of this repository: install from the lockfile, build (which checks the
# catalog), and run the tests. The pre-push hook runs it before anything leaves the machine.
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm install --frozen-lockfile
pnpm check
