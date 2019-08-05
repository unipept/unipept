#!/bin/bash
# adds indexes to the unipept database
logfile=$(date +%F_%T).txt
sequencesTable="sequences"
# sequencesTable="sequences_compressed"

echo "Script started" > $logfile

function print {
    echo $(date +'%F %T') $1 | tee -a $logfile
}

function print {
    echo $(date -u) $1
}

function doCmd {
    echo -n "-> "
    print "$1"
    echo $1 | mysql -u unipept -punipept unipept 2>&1 | sed "s/^/   /" | grep -v "Using a password on the command line interface can be insecure" | tee -a $logfile
}


# print "adding index to taxons"
# doCmd "ALTER TABLE taxons ADD INDEX fk_taxon_taxon (parent_id ASC);"

print "adding index to uniprot_entries"
doCmd "ALTER TABLE uniprot_entries ADD INDEX fk_uniprot_entries_taxons (taxon_id ASC);"
# doCmd "ALTER TABLE uniprot_entries ADD UNIQUE INDEX idx_uniprot_entries_accession (uniprot_accession_number ASC);"

print "adding index to ec_numbers"
doCmd "ALTER TABLE ec_numbers ADD UNIQUE INDEX idx_ec_numbers (code ASC);"

print "adding index to go_terms"
doCmd "ALTER TABLE go_terms ADD UNIQUE INDEX idx_go_code (code ASC);"

print "adding index to $sequencesTable"
doCmd "ALTER TABLE $sequencesTable ADD UNIQUE INDEX idx_sequences (sequence ASC);"
doCmd "ALTER TABLE $sequencesTable ADD INDEX fk_sequences_taxons (lca ASC);"
doCmd "ALTER TABLE $sequencesTable ADD INDEX fk_sequences_taxons_2 (lca_il ASC);"

print "adding index to peptides"
doCmd "ALTER TABLE peptides ADD INDEX fk_peptides_sequences (sequence_id ASC);"
doCmd "ALTER TABLE peptides ADD INDEX fk_peptides_uniprot_entries (uniprot_entry_id ASC);"
doCmd "ALTER TABLE peptides ADD INDEX fk_peptides_original_sequences (original_sequence_id ASC);"

print "adding index to embl_cross_references"
doCmd "ALTER TABLE embl_cross_references ADD INDEX fk_embl_reference_uniprot_entries (uniprot_entry_id ASC);"
# doCmd "ALTER TABLE embl_cross_references ADD INDEX idx_sequence_id (sequence_id ASC);"

print "adding index to refseq_cross_references"
doCmd "ALTER TABLE refseq_cross_references ADD INDEX fk_refseq_reference_uniprot_entries (uniprot_entry_id ASC);"

print "adding index to go_cross_references"
doCmd "ALTER TABLE go_cross_references ADD INDEX fk_go_reference_uniprot_entries (uniprot_entry_id ASC);"
# doCmd "ALTER TABLE go_cross_references ADD INDEX fk_go_cross_reference_go_terms_idx (go_term_code ASC);"

print "adding index to ec_cross_references"
doCmd "ALTER TABLE ec_cross_references ADD INDEX fk_ec_reference_uniprot_entries (uniprot_entry_id ASC);"
# doCmd "ALTER TABLE ec_cross_references ADD INDEX fk_ec_terms_reference_go_terms_idx (ec_number_code ASC);"

print "adding index to proteomes"
doCmd "ALTER TABLE proteomes ADD INDEX fk_taxons_proteomes (taxon_id ASC);"

print "adding index to proteome_cross_references"
doCmd "ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references_uniprot_entries (uniprot_entry_id ASC);"
doCmd "ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references (proteome_id ASC);"

print "Done"
