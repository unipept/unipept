#!/bin/bash
# Downloads the prokaryotes.txt file and loads them into the genomes table

datadir="../data"
currentdir=`pwd`

# prepare the sql file
cd "${datadir}"
rm -f prokaryotes.txt
rm -f prokaryotes.sql
wget ftp://ftp.ncbi.nlm.nih.gov/genomes/GENOME_REPORTS/prokaryotes.txt
echo "TRUNCATE TABLE genomes; TRUNCATE TABLE genome_caches;" > prokaryotes.sql
IFS=$(echo -e "\t")
cat prokaryotes.txt | cut -f1,4,10,12,19 | egrep -v -- "-.-|^#" | sed "s/^\([^	]*	[^	]*	[^	]*\)	/\1,/" | sed "s/,-//" | sed "s/-,//" | sed "s/'//g" |
while read -a line; do
    IFS=',' read -a sequences <<< "${line[2]}"
    for element in "${sequences[@]}"
    do
        element=`echo $element | sed "s/\..*$//"`
        echo "INSERT INTO genomes (name, bioproject_id, insdc_id, status) VALUES ('${line[0]}', '${line[1]}', '$element', '${line[3]}');" >> prokaryotes.sql
    done
done

# load the file into the database
echo "loading the database"
mysql -u unipept -punipept unipept < "prokaryotes.sql"

cd "${currentdir}"

# precompute some stuff
echo "precomputing the taxa"
rails runner "Genome.precompute_taxa"

echo "precomputing the genome caches"
rails runner "Genome.precompute_genome_caches"
