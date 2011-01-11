#!/bin/bash

datadir="data"

# create directory for storing genome sequences
genomedir="${datadir}/genomes"
bactdir="${genomedir}/bacteria"
bactdir_complete="${bactdir}/complete"

rm -r ${bactdir_complete}
mkdir -p ${genomedir}
mkdir -p ${bactdir}
mkdir -p ${bactdir_complete}

# download and unpack bacterial genomes
cd "${bactdir_complete}"
wget "ftp://ftp.ncbi.nih.gov/genomes/Bacteria/all.gbk.tar.gz"    # download genome sequences from NCBI (may take some time)
tar xvzf all.gbk.tar.gz                                          # unpack genome sequences
rm all.gbk.tar.gz

# create list of accession numbers
cd ${genomedir}
find ${genomedir} -name '*.gbk' | sed 's/\(.*\/\([^/.]*\).gbk\)/\2\t\1/' > acc.txt
