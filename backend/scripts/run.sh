#!/bin/bash

# Set up the unipept database
echo "Build database - compile#0" > public/progress

# Compile everything
./backend/scripts/compile.sh
#echo "Build database - download uniprot#15" > public/progress

# Download Uniprot
#./backend/scripts/downloadUniprot.sh
#echo "Build database - load taxa#30" > public/progress

# Load Taxon
#./backend/scripts/loadTaxon.sh
#echo "Build database - load uniprot#45" > public/progress

# Load Uniprot
touch empty
backend/java/bin/peptide_loader ../data/uniprot/uniprot_sprot.xml.gz empty #../data/uniprot/uniprot_trembl.xml.gz
echo "Build database - invalidate taxa#95" > public/progress

# Invalidate taxa
./backend/scripts/invalidateTaxon.sh
rm public/progress
