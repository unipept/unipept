#!/bin/bash

source config

set -e
trap "mailx -s 'Unipept Database Build Failed' -a '$LOGFILE' 'unipept@ugent.be' <<<'EOM'" EXIT

> "$LOGFILE"
./log "Starting unipept backend run."

newstamp="$(mktemp)"
oldstamp="$DATADIR/.STAMP"

# Get the new "Last Modified" stamp from uniprot.
curl -s --head "$UNIPROT_URL/uniprot_trembl.xml.gz" > "$newstamp"

# If there's an old stamp and it's the same as the new one, there's
# no new database, so we just exit.
if [ -f "$oldstamp" ]; then
    if diff -q "$oldstamp" "$newstamp" 2>/dev/null; then
        ./log "No new version available online."
        ./log "Current version is $(head -1 "$oldstamp")"
        trap - EXIT
        exit
    fi
    ./log "New version available online."
    ./log "Old version was $(head -1 "$oldstamp")"
    ./log "New version is $(head -1 "$newstamp")"
else
    touch "$oldstamp"
    ./log "No local version."
    ./log "New version is $(head -1 "$newstamp")"
fi

mv "$newstamp" "$oldstamp"

# Start the actual downloads.
./log "Starting download."
make --quiet -B download > >(./log) 2>&1
./log "Finished download."

# If we've got maven installed, rebuild the backend.
if hash mvn && [ -f pom.xml ]; then
    ./log "Rebuilding the unipept jar."
    make --quiet jar > >(./log) 2>&1
    ./log "Finished rebuilding the unipept jar."
fi

# Remake everything with the new downloads (and new jar).
./log "Starting calculation of the database tables."
make --quiet > >(./log) 2>&1
./log "Finished calculation of the database tables."

# Everythin went well, let's clean.
./log "Starting the cleanup."
make --quite clean_intermediates > >(./log) 2>&1
./log "Finished the cleanup."

mailx -s "Unipept Database Build Successful" -a "$LOGFILE" unipept@ugent.be <<<"EOM"

