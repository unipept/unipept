#!/bin/bash

datadir="data"

# create directory for storing genome sequences
uniprotdir="${datadir}/uniprot"

rm -rf ${uniprotdir}
mkdir -p ${uniprotdir}

# download and unpack data
cd "${uniprotdir}"
wget ftp://ftp.expasy.org/databases/uniprot/current_release/knowledgebase/complete/uniprot_sprot.xml.gz
wget ftp://ftp.expasy.org/databases/uniprot/current_release/knowledgebase/complete/uniprot_trembl.xml.gz

gunzip uniprot_sprot.xml.gz  
gunzip uniprot_trembl.xml.gz 

cd ../..