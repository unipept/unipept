#!/bin/bash

#relative data dir
datadir="data"

# create directory for storing genome sequences
genomedir="${datadir}/genomes"
bactdir="${genomedir}/bacteria"
bactdir_draft="${bactdir}/draft"

rm -rf ${bactdir_draft}
mkdir -p ${genomedir}
mkdir -p ${bactdir}
mkdir -p ${bactdir_draft}

cd "${bactdir_draft}"
cdir=`pwd`

# download and unpack bacterial genomes
for dir in $(wget -qO - ftp://ftp.ncbi.nih.gov/genomes/Bacteria_DRAFT/ | grep 'Directory' | sed 's/^.*>\(.*\)\/<.*$/\1/')
do
 echo -n "processing ${dir} ... "
 mkdir -p ${dir}
 cd ${dir}
 for file in $(wget -qO - ftp://ftp.ncbi.nih.gov/genomes/Bacteria_DRAFT/${dir}/ | grep 'gbk.tgz' | sed 's/^.* href="\(.*\)">.*$/\1/')
 do
  wget -q "${file}"
  if [ -f "$(basename $(echo "${file}"))" ]; then
   tar xzf $(basename $(echo "${file}"))
   rm -f $(basename $(echo "${file}"))
  fi
 done 
 cd "${cdir}"
 echo "DONE"
done

# create list of accession numbers
#cd ${genomedir}
#find ${genomedir} -name '*.gbk' | sed 's/\(.*\/\([^/.]*\).gbk\)/\2\t\1/' > acc.txt
