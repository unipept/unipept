#!/bin/bash

source config

set -e
trap "mailx -s 'Unipept Database Build Failed' -a '$LOGFILE' '$MAIL' <<<'EOM'" EXIT

log() {
    exec 3>&1
    exec >> "$LOGFILE"
    if [ -z "$1" ]; then
        while read line; do
            echo "[$(date)] $line"
        done
    else
        echo "[$(date)] $*"
    fi
    exec >&3
}
true > "$LOGFILE"
log "Starting unipept backend run."

newstamp="$(mktemp)"
oldstamp="$UNIDIR/.STAMP"

# Get the new "Last Modified" stamp from uniprot.
curl -s --head "$UNIPROT_URL/uniprot_trembl.xml.gz" > "$newstamp"

# If there's an old stamp and it's the same as the new one, there's
# no new database, so we just exit.
if [ -f "$oldstamp" ]; then
    if diff -q "$oldstamp" "$newstamp" 2>/dev/null; then
        log "No new version available online."
        log "Current version is $(head -1 "$oldstamp")"
        trap - EXIT
        exit
    fi
    log "New version available online."
    log "Old version was $(head -1 "$oldstamp")"
    log "New version is $(head -1 "$newstamp")"
else
    mkdir -p "$UNIDIR"
    touch "$oldstamp"
    log "No local version."
    log "New version is $(head -1 "$newstamp")"
fi

# Start the actual downloads.
log "Starting download."
make --quiet -B download > >(log) 2>&1
log "Finished download."

# If we've got maven installed, rebuild the backend.
if hash mvn 2>/dev/null && [ -f pom.xml ]; then
    log "Rebuilding the unipept jar."
    make --quiet jar > >(log) 2>&1
    log "Finished rebuilding the unipept jar."
fi

# Remake everything with the new downloads (and new jar).
log "Starting calculation of the database tables."
make --quiet > >(log) 2>&1
log "Finished calculation of the database tables."

# Everythin went well, let's clean.
log "Starting the cleanup."
make --quiet clean_intermediates > >(log) 2>&1
log "Finished the cleanup."

trap - EXIT
mv "$newstamp" "$oldstamp"
mailx -s "Unipept Database Build Successful" -a "$LOGFILE" "$MAIL" <<<"EOM"

