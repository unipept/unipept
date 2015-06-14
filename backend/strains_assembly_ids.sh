#!/bin/bash

# Arguments:
# - The gunzipped assembly file.
# - The output file.
assembly_gz_file="$1"
outfile="$2"

# Please crash on first mistake.
set -e

tempfile="$(mktemp)"
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
    echo "$retstart"
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
    echo "$returned"
    retstart="$((retstart + returned))"
done

join -1 2 -2 1 -a 1 -t '	'                    \
        <(zcat "$assembly_gz_file")              \
        <(sed "s/$/\t\x01/" "$tempfile" | sort)  \
    | sed -e "/\x01$/!s/$/	\x00/"               \
          -e 's/^\([^\t]*\)\t\([^\t]*\)/\2\t\1/' \
    | gzip -                                     \
    > "$outfile"

rm "$tempfile"

