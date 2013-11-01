#!/bin/bash

# Set up the unipept database
echo "Build database - compile#0" > public/progress

# Compile everything
./tools/scripts/compile.sh
echo "Build database - download uniprot#15" > public/progress

# Download Uniprot
./tools/scripts/downloadUniprot.sh
echo "Build database - load taxa#30" > public/progress

# Load Taxon
./tools/scripts/loadTaxon.sh
echo "Build database - load uniprot#45" > public/progress

# Load Uniprot
java -cp "tools/java:tools/java/bin:tools/java/bin/:tools/java/lib/mysql.jar" -Xmx1g tools/commandline/PeptideLoader ../data/uniprot/uniprot_sprot.xml ../data/uniprot/uniprot_trembl.xml
echo "Build database - invalidate taxa#95" > public/progress

# Invalidate taxa
./tools/scripts/invalidateTaxon.sh
rm public/progress