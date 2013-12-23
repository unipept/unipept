#!/bin/bash

# set up dirs
datadir="../data"
currentdir=`pwd`

# create directory for storing genome sequences
uniprotdir="${datadir}/uniprot"

# remove old data
rm -rf ${uniprotdir}
mkdir -p ${uniprotdir}

# download and unpack data
cd "${uniprotdir}"
wget -q ftp://ftp.expasy.org/databases/uniprot/current_release/knowledgebase/complete/uniprot_sprot.xml.gz
wget -q ftp://ftp.expasy.org/databases/uniprot/current_release/knowledgebase/complete/uniprot_trembl.xml.gz

gunzip uniprot_sprot.xml.gz
gunzip uniprot_trembl.xml.gz

cd ${currentdir}