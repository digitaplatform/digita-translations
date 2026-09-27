# The fixed check of this repository: install from the lockfile, build (which checks the
# catalog), and run the tests. The pre-push hook runs it before anything leaves the machine.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
pnpm check
exit $LASTEXITCODE
