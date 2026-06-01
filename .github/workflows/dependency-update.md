---
description: "Update all npm dependencies to their latest stable versions published at least 7 days ago, validate the full test suite, and open a pull request with the successful updates."
emoji: "📦"
labels: [dependencies, automation]

on:
  schedule:
    - cron: 'weekly on friday'
  workflow_dispatch:

engine: copilot

permissions:
  contents: read
  pull-requests: read

tools:
  bash: [":*"]

safe-outputs:
  create-pull-request:
    title-prefix: "chore: "
    labels: [dependencies]

network:
  allowed:
    - defaults
    - node

runtimes:
  node:
    version: "26"

timeout-minutes: 60
---

Update all dependencies in `package.json` to their latest stable versions, following the rules below.

## Eligibility rules

- **7-day cooldown**: Only upgrade to versions published at least 7 days ago. Use `npx --yes npm-check-updates --cooldown 7` to identify eligible upgrades. This is a security measure: it ensures the community has had time to detect compromised packages before we adopt them.
- **Stable releases only**: Skip any update where the newest available version is a pre-release (alpha/beta/rc). Exception: if a dependency is currently pinned to a pre-release and a newer stable version exists, upgrade to the stable version.
- **Skip local references**: Do not modify the `peptonizer` dependency — it is a local file reference (`file:./peptonizer-v0.0.31.tgz`).

## Steps

1. Install current dependencies: `yarn install`.
2. Run `npx --yes npm-check-updates --cooldown 7 -u` to apply eligible upgrades to `package.json`.
3. Run `yarn install` to update `yarn.lock`.
4. Install Playwright browsers: `npx playwright install --with-deps`.
5. Validate the full suite in this order:
   - `yarn run types:check`
   - `yarn lint`
   - `yarn test`
   - `yarn test:e2e`
6. If validation fails, use binary search to isolate the offending dependency or dependencies. Revert those entries in `package.json`, run `yarn install`, and repeat validation until the suite passes cleanly.
7. Create a single pull request targeting the `develop` branch that bundles all successful updates, using:
   - **Title**: `chore: weekly dependency updates YYYY-MM-DD` (today's date)
   - **Body**: a Markdown table with columns `Package | Old version | New version` for every updated dependency; if any were excluded due to validation failures, add a second table with columns `Package | Attempted version | Failure summary`.
