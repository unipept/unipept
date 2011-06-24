cd data/taxon
rm *
wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip
unzip taxdmp.zip
cd ../..
java -cp ".:bin:bin/:lib/mysql.jar" -Xmx512m tools/commandline/TaxonLoader data/taxon/nodes.dmp data/taxon/names.dmp
java -cp ".:bin:bin/:lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader load
