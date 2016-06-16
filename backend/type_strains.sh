#!/bin/bash

# Arguments: none

# Please crash on first mistake.
set -e

tempfile="$(mktemp -t 'tmp_file')"
> "$tempfile"

header="$(curl -d 'db=assembly'                       \
               -d 'term="sequence from type"'         \
               -d 'field=filter'                      \
               -d 'usehistory=y'                      \
               "$ENTREZ_URL/esearch.fcgi"             \
        | grep -e 'QueryKey' -e 'WebEnv' | tr -d '\n' \
        )"

query_key="$(echo "$header"                                   \
           | sed -n 's/.*<QueryKey>\(.*\)<\/QueryKey>.*/\1/p' \
           )"

web_env="$(echo "$header"                               \
         | sed -n 's/.*<WebEnv>\(.*\)<\/WebEnv>.*/\1/p' \
         )"

returned="$BATCH_SIZE"
retstart='1'
while ((returned == BATCH_SIZE)); do
    returned="$(curl -d 'db=assembly'                       \
                     -d "query_key=$query_key"              \
                     -d "WebEnv=$web_env"                   \
                     -d "retmax=$ENTREZ_BATCH_SIZE"         \
                     -d "retstart=$retstart"                \
                     "$ENTREZ_URL/esummary.fcgi"            \
              | grep '<Genbank>'                            \
              | sed -e 's/<[^>]*>//g' -e 's/[ \t][ \t]*//g' \
              | tee -a "$tempfile"                          \
              | wc -l                                       \
              )"
    retstart="$((retstart + returned))"
done

# write out the type strain assembly ids
cat "$tempfile"

rm "$tempfile"