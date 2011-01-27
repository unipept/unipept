#!/bin/bash

datadir="data"

# create directory for storing genome sequences
genomedir="${datadir}/genomes"
bactdir="${genomedir}/bacteria"
bactdir_draft="${bactdir}/draft"

rm -rf ${bactdir_draft}
mkdir -p ${genomedir}
mkdir -p ${bactdir}
mkdir -p ${bactdir_draft}

# download and unpack bacterial genomes
cd "${bactdir_draft}"

#for file in $(wget -qO - ftp://ftp.ncbi.nih.gov/genomes/Bacteria/lproks_2.txt | grep -v 'no sequence' | awk -F'\t' '$1!=""' | awk -F'\t' '{gsub(" sp.","",$4);gsub(" ","_",$4);gsub("-","_",$4);printf("%s_uid%s/%s\n",$4,$1,$8)}'fo$
#for file in $(wget -qO - ftp://ftp.ncbi.nih.gov/genomes/Bacteria/lproks_2.txt | grep -v 'no sequence' | awk -F'\t' '$1!=""' | awk -F'\t' '{gsub(" sp.","",$4);gsub(" ","_",$4);gsub("-","_",$4);printf("%s_uid%s/%s\n",$4,$1,$8)}' $
for file in $(wget -qO - ftp://ftp.ncbi.nih.gov/genomes/Bacteria/lproks_2.txt | grep -v 'no sequence' | awk -F'\t' '$1!=""' | awk -F'\t' '{gsub(" sp.","",$4);gsub(" ","_",$4);gsub("-","_",$4);printf("%s_uid%s/%s\n",$4,$1,$8)}' $
do
 dir=$(dirname $(echo $file))
 echo -n "processing ${dir} ... "
 mkdir -p ${dir}
 cd ${dir}
 wget -q "ftp://ftp.ncbi.nih.gov/genomes/Bacteria_DRAFT/${file}.contig.gbk.tgz"
 if [ -f "$(basename $(echo "${file}.contig.gbk.tgz"))" ]; then
   tar xzf $(basename $(echo "${file}.contig.gbk.tgz"))
   rm -f $(basename $(echo "${file}.contig.gbk.tgz"))
 fi
 wget -q "ftp://ftp.ncbi.nih.gov/genomes/Bacteria_DRAFT/${file}.scaffold.gbk.tgz"
 if [ -f "$(basename $(echo "${file}.scaffold.gbk.tgz"))" ]; then
   tar xzf $(basename $(echo "${file}.scaffold.gbk.tgz"))
   rm -f $(basename $(echo "${file}.scaffold.gbk.tgz"))
 fi
 cd ..
 echo "DONE"
done

# create list of accession numbers
cd ${genomedir}
find ${genomedir} -name '*.gbk' | sed 's/\(.*\/\([^/.]*\).gbk\)/\2\t\1/' > acc.txt
