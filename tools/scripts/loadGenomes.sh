#!/bin/bash
# Downloads the prokaryotes.txt file and loads them into the genomes table

datadir="../data"
currentdir=`pwd`

# prepare the sql file
cd "${datadir}"
rm -f prokaryotes.txt
rm -f prokaryotes.sql
wget ftp://ftp.ncbi.nlm.nih.gov/genomes/GENOME_REPORTS/prokaryotes.txt
echo "TRUNCATE TABLE genomes;" > prokaryotes.sql
IFS=$(echo -e "\t")
cat prokaryotes.txt | cut -f1,4,9,19 | egrep -v -- "-|#" | sed "s/'//g" |
while read -a line; do
    IFS=',' read -a sequences <<< "${line[2]}"
    for element in "${sequences[@]}"
    do
        echo "INSERT INTO genomes (name, bioproject_id, refseq_id, status) VALUES ('${line[0]}', '${line[1]}', '$element', '${line[3]}');" >> prokaryotes.sql
    done
done

# load the file into the database
mysql -u unipept -punipept unipept < "prokaryotes.sql"

cd "${currentdir}"

# populate the species and genus id's
rails runner "Genome.precompute_species_and_genera"