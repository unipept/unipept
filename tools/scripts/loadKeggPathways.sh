#!/bin/sh -e
paths=$(mktemp)
mapping=$(mktemp)
sql=$(mktemp)
numbers=$(mktemp)

wget -nv -O $paths http://rest.kegg.jp/list/path
echo "TRUNCATE TABLE kegg_pathways;" > $sql

sed 's/^path:\([^\t]*\)\t\([^\t]*\)/INSERT INTO kegg_pathways (long_id, name) VALUES ("\1", "\2");/' $paths >> $sql

echo "loading the database"
mysql -u unipept -punipept unipept < $sql

wget -nv -O - http://rest.kegg.jp/link/path/ec | fgrep 'path:map' > $mapping
echo "TRUNCATE TABLE kegg_pathway_mappings;" > $sql

mysql -punipept -u unipept -B -e 'SELECT * FROM ec_numbers' unipept | tail -n +2 > $numbers
mysql -punipept -u unipept -B -e 'SELECT * FROM kegg_pathways' unipept | tail -n +2 > $paths

sed 's/^ec:\([^\t]*\)\tpath:\([^\t]*\)/SELECT id FROM kegg_pathways WHERE long_id="\2";SELECT id FROM ec_numbers WHERE number="\1";/' $mapping | mysql -punipept -u unipept unipept -B | grep -v '^id$' | sed 'N;s/^\(.*\)\n\(.*\)$/INSERT INTO kegg_pathway_mappings (kegg_pathway_id, ec_number_id) VALUES ("\1", "\2");/' >> $sql

echo "loading the database"
mysql -u unipept -punipept unipept < $sql

rm $paths
rm $mapping
rm $numbers
rm $sql
