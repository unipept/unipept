#!/bin/sh
tempfile=$(mktemp)
echo "TRUNCATE TABLE kegg_pathways;" > pathways.sql
mysql -p -u unipept -B -e 'SELECT number FROM ec_numbers' unipept | tail -n +2 | while read number; do
	wget "http://www.genome.jp/dbget-bin/get_linkdb?-t+pathway+ec:$number" -q -O - | fgrep 'kegg-bin/show_pathway' > $tempfile
	
	sed 's/^.*">\(.*\)<\/a>   *\([^ ].*\)$/INSERT INTO kegg_pathways (long_id, name) VALUES ("\1", "\2");/' $tempfile >> pathways.sql
	sed 's/^.*">\(.*\)<\/a>   *\([^ ].*\)$/INSERT INTO kegg_pathways_mappings (long_id, ec_number) VALUES ("\1", "'"$number"'");/' $tempfile >> pathways.sql
done

rm $tempfile
