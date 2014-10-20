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

# Invalidate taxa
echo "Build database - invalidate taxa#45" > public/progress
./backend/scripts/invalidateTaxon.sh

# Load Uniprot
echo "Build database - load uniprot#50" > public/progress
touch empty
backend/java/bin/peptide_loader ../data/uniprot/uniprot_sprot.xml.gz empty #../data/uniprot/uniprot_trembl.xml.gz

rm public/progress
