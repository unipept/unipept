#!/bin/bash

# Arguments:
# - The gzipped proteomes file.
# - The output file.
proteome_gz_file="$1"
type_strains="$2"
outfile="$3"

set -e

tmp="$(mktemp proteomes.XXXXXXX)"
echo "$tmp"

get_proteome() {
    local id="$1"
    local accession="$2"
    curl -s http://www.uniprot.org/proteomes/$accession \
        | html2text -nobs -width 1000 \
        | awk -f proteomes.awk -v id=$id -v accession=$accession
}
# to reach it with the bash subprocess of xargs
export -f get_proteome

zcat $proteome_gz_file | xargs -P 10 -I{} bash -c 'get_proteome {}' > "$tmp"

join -1 8 -2 1 -a 1 -t '	'                                         \
        <(sort -t'	' -k 8 "$tmp")                                    \
        <(sort "$type_strains" | sed 's/$/\t\x01/')                   \
    | sed "/\x01$/!s/$/	\x00/"                                        \
    | awk 'BEGIN { FS = OFS = "	" }{ print $2,$3,$4,$5,$9,$7,$8,$1 }' \
    | sort -n                                                         \
    | gzip                                                            \
    > $outfile

rm "$tmp"
