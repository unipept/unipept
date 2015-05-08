#!/bin/bash

source config

> "$LOGFILE"
./log "Starting unipept backend run."

newstamp="$(mktemp)"
oldstamp="$DATADIR/.STAMP"

# Get the new "Last Modified" stamp from uniprot.
curl -s --head "$UNIPROT_URL/uniprot_trembl.xml.gz" > "$newstamp"

# If there's an old stamp and it's the same as the new one, there's
# no new database, so we just exit.
if [ -f "$oldstamp" ] && diff -q "$oldstamp" "$newstamp" 2>/dev/null; then
    ./log "No new version available online."
    ./log "Current version is $(head -1 "$oldstamp")"
    exit
fi
touch "$oldstamp"

./log <<HERE
New version available online.
Old version was $(head -1 "$oldstamp")
New version is $(head -1 "$newstamp")
HERE

mv "$newstamp" "$oldstamp"

# Start the actual downloads.
./log "Starting download."
make --quiet -B download 2>&1 | ./log
./log "Finished download."

# If we've got maven installed, rebuild the backend.
if hash mvn && [ -f pom.xml ]; then
    ./log "Rebuilding the unipept jar."
    make --quiet jar 2>&1 | ./log
    ./log "Finished rebuilding the unipept jar."
fi

# Remake everything with the new downloads (and new jar).
./log "Starting calculation of the database tables."
make --quiet 2>&1 | ./log
./log "Finished calculation of the database tables."

