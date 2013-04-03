rm -rf data/taxon
mkdir -p data/taxon
cd data/taxon
wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip
unzip taxdmp.zip
cd ../..
java -cp "tools/java:tools/java/bin:tools/java/bin/:tools/java/lib/mysql.jar" -Xmx512m tools/commandline/TaxonLoader data/taxon/nodes.dmp data/taxon/names.dmp
#java -cp ".:bin:bin/:lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader load
