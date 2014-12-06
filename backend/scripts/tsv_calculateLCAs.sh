#!/bin/bash

function print {
    echo "$(date -u) $1"
}

peptides="peptides.tsv"
uniprotEntries="uniprotEntries.tsv"

#datadir="../data/lca"
#rm -rf "${datadir}"
#currentdir=`pwd`
#mkdir -p "${datadir}"

function join_tables() { # {{{
cat - <<-HERE
BEGIN {
    OFS = "\\t"
    uniprot_entry_id = 0
    taxon_id = 0
    getline < "$uniprotEntries"
}
NR > 1 {
    sequence_id = \$$1
    entry_id = \$3
    while(entry_id > uniprot_entry_id) {
        getline < "$uniprotEntries"
        uniprot_entry_id = \$1
        taxon_id = \$4
    }
    print sequence_id, taxon_id
}
HERE
} # }}}

print "Joining peptides" # {{{
cat "$peptides" | awk -F'\t' "$(join_tables 2)" > sequence_taxon.tsv
head sequence_taxon.tsv | od -c
# }}}

print "Sorting peptides" # {{{
cat sequence_taxon.tsv | sort -S 20% -k1n | gzip - > sequence_taxon.tsv.gz
rm sequence_taxon.tsv
# }}}

print "Joining original peptides" # {{{
cat "$peptides" | awk -F'\t' "$(join_tables 3)" > original_sequence_taxon.tsv
# }}}

print "Sorting original peptides" # {{{
cat original_sequence_taxon.tsv | sort -S 20% -k1n | gzip - > original_sequence_taxon.tsv.gz
rm original_sequence_taxon.tsv
# }}}

print "Select all but id from lineages" # {{{
cut --complement -f1 "lineages.tsv" > "noid_lineages.tsv"
# }}}

print "Start calculating LCAs" # {{{
backend/java/bin/lca_calculator "noid_lineages.tsv" "sequence_taxon.tsv.gz" "LCAs.tsv"
backend/java/bin/lca_calculator "noid_lineages.tsv" "original_sequence_taxon.tsv.gz" "original_LCAs.tsv"
# }}}

print "Removing files" # {{{
rm -f "sequence_taxon.tsv.gz"
rm -f "original_sequence_taxon.tsv.gz"
# }}}

print "Dumping sequences" # {{{
# pass, we've allready got sequences.tsv
# }}}

print "Merging all data" # {{{
cat "sequences.tsv" | tail -n+2 | join --nocheck-order -a1 -t $'\t' -o "1.1 1.2 2.2" - "original_LCAs.tsv" | join --nocheck-order -t $'\t' -a1 -o "1.1 1.2 1.3 2.2" - "LCAs.tsv" > "lcad_sequences.dump"
# }}}

print "Storing sequences" # {{{
head -1 "sequences.tsv" | cat - "lcad_sequences.dump" > "lcad_sequences.tsv"
# }}}

print "Removing all files" # {{{
rm -f "lcad_sequences.dump"
# }}}

# print "Add sequences index" # {{{
# took 6 hours
# TODO
# }}}

# print "Add lca indices" # {{{
# TODO
# }}}

print "All done!"

# vim: foldmethod=marker
