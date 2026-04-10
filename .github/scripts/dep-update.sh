#!/usr/bin/env bash
# scripts/dep-update.sh
set -euo pipefail

SEVEN_DAYS_AGO=$(date -d '7 days ago' +%s)
UPDATED=(); SKIPPED=(); REVERTED=()

# --- Step 1: upgrade all eligible deps ---
DEPS=$(node -e "
  const p = require('./package.json');
  Object.keys({...p.dependencies, ...p.devDependencies}).forEach(d => console.log(d));
")

for DEP in $DEPS; do
  LATEST=$(npm view "$DEP" dist-tags.latest 2>/dev/null)
  PUBLISH_DATE=$(npm view "$DEP@$LATEST" time.$LATEST 2>/dev/null)
  PUBLISH_TS=$(date -d "$PUBLISH_DATE" +%s 2>/dev/null || echo 0)

  if (( PUBLISH_TS > SEVEN_DAYS_AGO )); then
    SKIPPED+=("$DEP@$LATEST (published $(( ($(date +%s) - PUBLISH_TS) / 86400 ))d ago)")
  else
    yarn add "$DEP@$LATEST" --exact 2>/dev/null
    UPDATED+=("$DEP@$LATEST")
  fi
done

if [ ${#UPDATED[@]} -eq 0 ]; then
  echo "any_changes=false" >> $GITHUB_OUTPUT
  exit 0
fi

# --- Step 2: run tests; bisect if they fail ---
if ! yarn test 2>/dev/null; then
  echo "Tests failed after bulk update — bisecting..."

  # Save the upgraded state, restore baseline
  cp package.json /tmp/package-upgraded.json
  cp yarn.lock /tmp/yarn-upgraded.lock
  git checkout -- package.json yarn.lock
  yarn install --frozen-lockfile

  for DEP in "${UPDATED[@]}"; do
    PKG="${DEP%@*}"   # strip version
    VER="${DEP##*@}"

    yarn add "$PKG@$VER" --exact 2>/dev/null
    if ! yarn test 2>/dev/null; then
      echo "  ⚠️  $DEP breaks tests — reverting"
      git checkout -- package.json yarn.lock
      yarn install --frozen-lockfile
      REVERTED+=("$DEP")
      UPDATED=("${UPDATED[@]/$DEP/}")
    else
      echo "  ✅ $DEP is safe"
    fi
  done
fi

# --- Step 3: write PR report ---
cat <<EOF > /tmp/pr-report.md
## 📦 Weekly Dependency Updates — $(date +%Y-%m-%d)

### ✅ Updated (${#UPDATED[@]})
$(printf '- %s\n' "${UPDATED[@]:-_none_}")

### ⚠️ Reverted — broke tests (${#REVERTED[@]})
$(printf '- %s\n' "${REVERTED[@]:-_none_}")

### ⏭️ Skipped — published < 7 days ago (${#SKIPPED[@]})
$(printf '- %s\n' "${SKIPPED[@]:-_none_}")
EOF

echo "any_changes=true" >> $GITHUB_OUTPUT
