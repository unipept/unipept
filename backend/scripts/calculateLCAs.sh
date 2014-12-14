#!/bin/bash

function print {
    echo $(date -u) $1
}

datadir="../data/lca"
rm -rf "${datadir}"
currentdir=`pwd`
mkdir -p "${datadir}"

print "Dumping lineages"
echo "select * from lineages;" | mysql -u unipept -punipept unipept > "${datadir}/lineages.tsv"

print "Dumping peptides"
echo "select sequence_id, taxon_id from peptides left join uniprot_entries on peptides.uniprot_entry_id = uniprot_entries.id;" | mysql -u unipept -punipept unipept -q > "${datadir}/peptides.tsv"
print "Sorting peptides"
cat "${datadir}/peptides.tsv" | sort -S 20% -k1n | gzip - > "${datadir}/peptides.tsv.gz"
rm "${datadir}/peptides.tsv"

print "Dumping original peptides"
echo "select original_sequence_id, taxon_id from peptides left join uniprot_entries on peptides.uniprot_entry_id = uniprot_entries.id;" | mysql -u unipept -punipept unipept -q > "${datadir}/original_peptides.tsv"
print "Sorting original peptides"
cat "${datadir}/original_peptides.tsv" | sort -S 20% -k1n | gzip - > "${datadir}/original_peptides.tsv.gz"
rm "${datadir}/original_peptides.tsv"

print "Start calculating LCAs"
backend/java/bin/lca_calculator "${datadir}/lineages.tsv" "${datadir}/peptides.tsv.gz" "${datadir}/LCAs.tsv"

print "Start calculating LCAs"
backend/java/bin/lca_calculator "${datadir}/lineages.tsv" "${datadir}/original_peptides.tsv.gz" "${datadir}/original_LCAs.tsv"

print "Removing files"
rm -f "${datadir}/peptides.tsv.gz"
rm -f "${datadir}/original_peptides.tsv.gz"

print "Dumping sequences"
echo "select id, sequence from sequences order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | gzip - > "${datadir}/sequences.tsv.gz"

print "Merging all data"
zcat "${datadir}/sequences.tsv.gz" | join --nocheck-order -a1 -t $'\t' -o "1.1 1.2 2.2" - "${datadir}/original_LCAs.tsv" | join --nocheck-order -t $'\t' -a1 -o "1.1 1.2 1.3 2.2" - "${datadir}/LCAs.tsv" > "${datadir}/sequences.dump"

print "Dropping old sequences table"
echo "SET FOREIGN_KEY_CHECKS=0; DROP TABLE sequences; CREATE  TABLE IF NOT EXISTS unipept.sequences ( id INT UNSIGNED NOT NULL AUTO_INCREMENT , sequence VARCHAR(50) NOT NULL , lca MEDIUMINT UNSIGNED NULL , lca_il MEDIUMINT UNSIGNED NULL , PRIMARY KEY (id) ENGINE = InnoDB DEFAULT CHARACTER SET = ascii;" | mysql -u unipept -punipept unipept

print "Loading into the database"
mysqlimport -u unipept -punipept --local unipept "${datadir}/sequences.dump"
# took 90 minutes

print "Removing all files"
rm -f "${datadir}/sequences.tsv.gz"
rm -f "${datadir}/sequences.dump"

print "Add sequences index"
echo "ALTER TABLE unipept.sequences ADD UNIQUE INDEX idx_sequences (sequence ASC);" | mysql -u unipept -punipept unipept
# took 6 hours

print "Add lca indices"
echo "ALTER TABLE unipept.sequences ADD INDEX idx_lca (lca ASC), ADD INDEX idx_lca_il (lca_il ASC);" | mysql -u unipept -punipept unipept

print "All done!"

