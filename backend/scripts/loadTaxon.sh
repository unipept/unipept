#!/bin/bash
datadir="../data/taxon"

rm -rf "${datadir}"

currentdir=`pwd`

mkdir -p "${datadir}"
cd "${datadir}"

wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip
unzip taxdmp.zip

cd "${currentdir}"

java -cp "backend/java:backend/java/bin:backend/java/bin/:backend/java/lib/mysql.jar" -Xmx512m tools/commandline/TaxonLoader "${datadir}/nodes.dmp" "${datadir}/names.dmp"

# this creates the lineages. if you plan to invalidate some taxa, comment this
#java -cp ".:bin:bin/:lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader load
