#!/bin/bash

# Set up the unipept database
echo "Build database - compile#0" > public/progress

# Compile everything
./backend/scripts/compile.sh
echo "Build database - download uniprot#15" > public/progress

# Download Uniprot
./backend/scripts/downloadUniprot.sh
echo "Build database - load taxa#30" > public/progress

# Load Taxon
./backend/scripts/loadTaxon.sh
echo "Build database - load uniprot#45" > public/progress

# Load Uniprot
java -cp "backend/java:backend/java/bin:backend/java/bin/:backend/java/lib/mysql.jar" -Xmx1g tools/commandline/PeptideLoader ../data/uniprot/uniprot_sprot.xml ../data/uniprot/uniprot_trembl.xml
echo "Build database - invalidate taxa#95" > public/progress

# Invalidate taxa
./backend/scripts/invalidateTaxon.sh
rm public/progress