#!/bin/bash

# Arguments:
# - The gzipped proteomes file.
# - The output file.
proteome_gz_file="$1"
outfile="$2"

gzcat $proteome_gz_file | while read id accession; do
    curl -s http://www.uniprot.org/proteomes/$accession | html2text -width 1000 | awk -f proteomes.awk -v id=$id -v accession=$accession
done | gzip > $outfile
