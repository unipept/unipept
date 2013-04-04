#!/bin/bash

rm -rf ../data/taxon

currentdir=`pwd`

mkdir -p ../data/taxon
cd data/taxon

wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip
unzip taxdmp.zip

cd ${currentdir}

java -cp "tools/java:tools/java/bin:tools/java/bin/:tools/java/lib/mysql.jar" -Xmx512m tools/commandline/TaxonLoader ../data/taxon/nodes.dmp ../data/taxon/names.dmp

# this creates the lineages. if you plan to invalidate some taxa, comment this
#java -cp ".:bin:bin/:lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader load
