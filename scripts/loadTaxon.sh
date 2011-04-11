wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip -O data/taxon/taxon.zip
unzip data/taxon/taxon.zip
java -cp ".:bin:bin/:lib/bytecode.jar:lib/patricia.jar:lib/mysql.jar:lib/biojava.jar" -Xmx512m tools/commandline/TaxonLoader data/taxon/nodes.dmp data/taxon/names.dmp
java -cp ".:bin:bin/:lib/bytecode.jar:lib/patricia.jar:lib/mysql.jar:lib/biojava.jar" -Xmx512m tools/commandline/PeptideLoader load