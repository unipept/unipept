datadir="data"
cd "${datadir}"
rm prokaryotes.txt
rm prokaryotes.sql
wget ftp://ftp.ncbi.nlm.nih.gov/genomes/GENOME_REPORTS/prokaryotes.txt
touch prokaryotes.sql
cat prokaryotes.txt | cut -f3 -f8 -f18 | egrep -v -- "-|#" | 
while read -a line; do 
    IFS=',' read -a sequences <<< "${line[1]}"
    for element in "${sequences[@]}"
    do
        echo "INSERT INTO genomes (bioproject_id, insdc, status) VALUES ('${line[0]}', '$element', '${line[2]}');" >> prokaryotes.sql
    done
done
