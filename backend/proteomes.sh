#!/bin/bash

# Arguments:
# - The gzipped proteomes file.
# - The output file.
proteome_gz_file="$1"
type_strains="$2"
outfile="$3"

tmp="$(mktemp)"

gzcat $proteome_gz_file | head | while read id accession; do
    curl -s http://www.uniprot.org/proteomes/$accession \
        | html2text -nobs -width 1000 \
        | awk -f proteomes.awk -v id=$id -v accession=$accession
done > "$tmp"

join -1 8 -2 1 -a 1 -t '	'                                         \
        <(sort -t'	' -k 8 "$tmp")                                    \
        <(sort "$type_strains" | sed 's/$/\t\x01/')                   \
    | sed "/\x01$/!s/$/	\x00/"                                        \
    | awk 'BEGIN { FS = OFS = "	" }{ print $2,$3,$4,$5,$9,$7,$8,$1 }' \
    | sort -n                                                         \
    | gzip                                                            \
    > $outfile

rm "$tmp"

