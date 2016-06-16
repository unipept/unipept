#!/bin/bash
# adds indexes to the unipept database

function print {
    echo $(date -u) $1
}


# print "adding index to taxons"
# echo "ALTER TABLE taxons ADD INDEX fk_taxon_taxon (parent_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to uniprot_entries"
echo "ALTER TABLE uniprot_entries ADD INDEX fk_uniprot_entries_taxons (taxon_id ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE uniprot_entries ADD UNIQUE INDEX idx_uniprot_entries_accession (uniprot_accession_number ASC);" | mysql -u unipept -punipept unipept

print "adding index to ec_numbers"
echo "ALTER TABLE ec_numbers ADD UNIQUE INDEX idx_ec_numbers (ec_number ASC);" | mysql -u unipept -punipept unipept

print "adding index to go_terms"
echo "ALTER TABLE go_terms ADD UNIQUE INDEX idx_go_code (code ASC);" | mysql -u unipept -punipept unipept

print "adding index to sequences"
echo "ALTER TABLE sequences ADD UNIQUE INDEX idx_sequences (sequence ASC);" | mysql -u unipept -punipept unipept

print "adding index to sequences"
echo "ALTER TABLE sequences ADD INDEX fk_sequences_taxons (lca ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE sequences ADD INDEX fk_sequences_taxons_2 (lca_il ASC);" | mysql -u unipept -punipept unipept

print "adding index to peptides"
echo "ALTER TABLE peptides ADD INDEX fk_peptides_sequences (sequence_id ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE peptides ADD INDEX fk_peptides_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE peptides ADD INDEX fk_peptides_original_sequences (original_sequence_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to embl_cross_references"
echo "ALTER TABLE embl_cross_references ADD INDEX fk_embl_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept
# echo "ALTER TABLE embl_cross_references ADD INDEX idx_sequence_id (sequence_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to refseq_cross_references"
echo "ALTER TABLE refseq_cross_references ADD INDEX fk_refseq_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to go_cross_references"
echo "ALTER TABLE go_cross_references ADD INDEX fk_go_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept
# echo "ALTER TABLE go_cross_references ADD INDEX fk_go_cross_reference_go_terms_idx (go_term_code ASC);" | mysql -u unipept -punipept unipept

print "adding index to ec_cross_references"
echo "ALTER TABLE ec_cross_references ADD INDEX fk_ec_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept
# echo "ALTER TABLE ec_cross_references ADD INDEX fk_ec_terms_reference_go_terms_idx (ec_number_code ASC);" | mysql -u unipept -punipept unipept

print "adding index to proteomes"
echo "ALTER TABLE proteomes ADD INDEX fk_taxons_proteomes (taxon_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to proteome_cross_references"
echo "ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references (proteome_id ASC);" | mysql -u unipept -punipept unipept
