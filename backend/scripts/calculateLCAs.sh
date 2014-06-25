#!/bin/bash

function print {
    echo $(date -u) $0
}

datadir="../data/lca"
rm -rf "${datadir}"
currentdir=`pwd`
mkdir -p "${datadir}"

print "Dumping lineages"
echo "select * from lineages;" | mysql -u unipept -punipept unipept > "${datadir}/lineages.tsv"

print "Dumping peptides"
echo "select sequence_id, taxon_id from peptides left join uniprot_entries on peptides.uniprot_entry_id = uniprot_entries.id;" | mysql -u unipept -punipept unipept -q | sort -S 50% --parallel=12 -k1n | gzip - > "${datadir}/peptides.tsv.gz"

print "Dumping original peptides"
echo "select sequence_id, taxon_id from peptides left join uniprot_entries on peptides.uniprot_entry_id = uniprot_entries.id;" | mysql -u unipept -punipept unipept -q | sort -S 50% --parallel=12 -k1n | gzip - > "${datadir}/original_peptides.tsv.gz"

print "Start calculating LCAs"
backend/java/bin/lca_calculator "${datadir}/lineages.tsv" "${datadir}/peptides.tsv.gz" "${datadir}/LCAs.tsv"

print "Start calculating LCAs"
backend/java/bin/lca_calculator "${datadir}/lineages.tsv" "${datadir}/original_peptides.tsv.gz" "${datadir}/original_LCAs.tsv"

print "Removing files"
rm -f "${datadir}/peptides.tsv.gz"
rm -f "${datadir}/original_peptides.tsv.gz"

print "Dumping sequences"
echo "select id, sequence from sequences;" | mysql -u unipept -punipept unipept -q > "${datadir}/sequences.tsv"

# add merge stuff

print "All done!"

