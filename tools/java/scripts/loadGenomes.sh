datadir="data"
cd "${datadir}"
rm prokaryotes.txt
rm prokaryotes.sql
wget ftp://ftp.ncbi.nlm.nih.gov/genomes/GENOME_REPORTS/prokaryotes.txt
touch prokaryotes.sql
IFS='	'
cat prokaryotes.txt | cut -f1 -f3 -f8 -f18 | egrep -v -- "-|#" | sed "s/'//g" |
while read -a line; do 
    IFS=',' read -a sequences <<< "${line[2]}"
    for element in "${sequences[@]}"
    do
        echo "INSERT INTO genomes (name, bioproject_id, refseq_id, status) VALUES ('${line[0]}', '${line[1]}', '$element', '${line[3]}');" >> prokaryotes.sql
    done
done
