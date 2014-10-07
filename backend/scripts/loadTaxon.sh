#!/bin/bash
datadir="../data/taxon"

rm -rf "${datadir}"

currentdir=`pwd`

mkdir -p "${datadir}"
cd "${datadir}"

wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip
unzip taxdmp.zip

cd "${currentdir}"

backend/java/bin/taxon_loader "${datadir}/nodes.dmp" "${datadir}/names.dmp"

# this creates the lineages. if you plan to invalidate some taxa, comment this
#backend/java/bin/peptide_loader load
