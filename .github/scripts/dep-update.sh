#!/usr/bin/env bash
# scripts/dep-update.sh
set -euo pipefail

SEVEN_DAYS_AGO=$(date -d '7 days ago' +%s)
UPDATED=(); SKIPPED=(); REVERTED=()

# Helper: print array elements or a fallback string
print_array_or_none() {
  local -n _arr=$1
  if [ ${#_arr[@]} -eq 0 ]; then
    echo "_none_"
  else
    printf '- %s\n' "${_arr[@]}"
  fi
}

# --- Step 1: upgrade all eligible deps ---
DEPS=$(node -e "
  const p = require('./package.json');
  Object.keys({...p.dependencies, ...p.devDependencies}).forEach(d => console.log(d));
")

for DEP in $DEPS; do
  LATEST=$(npm view "$DEP" dist-tags.latest 2>/dev/null || true)
  if [ -z "$LATEST" ]; then
    echo "  Skipping $DEP — could not resolve latest version"
    continue
  fi

  PUBLISH_DATE=$(npm view "$DEP@$LATEST" time.$LATEST 2>/dev/null || true)
  PUBLISH_TS=$(date -d "$PUBLISH_DATE" +%s 2>/dev/null || echo 0)

  if (( PUBLISH_TS > SEVEN_DAYS_AGO )); then
    SKIPPED+=("$DEP@$LATEST (published $(( ($(date +%s) - PUBLISH_TS) / 86400 ))d ago)")
  else
    yarn add "$DEP@$LATEST" --exact
    UPDATED+=("$DEP@$LATEST")
  fi
done

if [ ${#UPDATED[@]} -eq 0 ]; then
  echo "any_changes=false" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

# --- Step 2: run tests; bisect if they fail ---
if ! yarn test; then
  echo "Tests failed after bulk update — bisecting..."

  # Save the upgraded state, restore baseline
  cp package.json /tmp/package-upgraded.json
  cp yarn.lock /tmp/yarn-upgraded.lock
  git checkout -- package.json yarn.lock
  yarn install --frozen-lockfile

  SAFE_UPDATED=()
  for DEP in "${UPDATED[@]}"; do
    PKG="${DEP%@*}"   # strip version
    VER="${DEP##*@}"

    yarn add "$PKG@$VER" --exact
    if ! yarn test; then
      echo "  $DEP breaks tests — reverting"
      git checkout -- package.json yarn.lock
      yarn install --frozen-lockfile
      REVERTED+=("$DEP")
    else
      echo "  $DEP is safe"
      SAFE_UPDATED+=("$DEP")
    fi
  done
  UPDATED=("${SAFE_UPDATED[@]+"${SAFE_UPDATED[@]}"}")
fi

# --- Step 3: write PR report ---
cat <<EOF > /tmp/pr-report.md
## Weekly Dependency Updates — $(date +%Y-%m-%d)

### Updated (${#UPDATED[@]})
$(print_array_or_none UPDATED)

### Reverted — broke tests (${#REVERTED[@]})
$(print_array_or_none REVERTED)

### Skipped — published < 7 days ago (${#SKIPPED[@]})
$(print_array_or_none SKIPPED)
EOF

echo "any_changes=true" >> "${GITHUB_OUTPUT:-/dev/null}"
