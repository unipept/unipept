#!/bin/bash
# adds indexes to the unipept database

function print {
    echo $(date -u) $1
}


print "adding index to taxons"
echo "ALTER TABLE taxons ADD INDEX fk_taxon_taxon (parent_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to uniprot_entries"
echo "ALTER TABLE uniprot_entries ADD INDEX fk_uniprot_entries_taxons (taxon_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to lineages"
echo "ALTER TABLE lineages ADD INDEX idx_species (species ASC);" | mysql -u unipept -punipept unipept

print "adding index to sequences"
echo "ALTER TABLE sequences ADD UNIQUE INDEX idx_sequences (sequence ASC);" | mysql -u unipept -punipept unipept

print "adding index to sequences"
echo "ALTER TABLE sequences ADD INDEX fk_sequences_taxons (lca ASC), ADD INDEX fk_sequences_taxons_2 (lca_il ASC);" | mysql -u unipept -punipept unipept

print "adding index to peptides"
echo "ALTER TABLE peptides ADD INDEX fk_peptides_sequences (sequence_id ASC), ADD INDEX fk_peptides_uniprot_entries (uniprot_entry_id ASC), ADD INDEX fk_peptides_original_sequences (original_sequence_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to embl_cross_references"
echo "ALTER TABLE embl_cross_references ADD INDEX fk_embl_reference_uniprot_entries (uniprot_entry_id ASC), ADD INDEX idx_sequence_id (sequence_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to refseq_cross_references"
echo "ALTER TABLE refseq_cross_references ADD INDEX fk_refseq_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to go_cross_references"
echo "ALTER TABLE go_cross_references ADD INDEX fk_go_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to ec_cross_references"
echo "ALTER TABLE ec_cross_references ADD INDEX fk_ec_reference_uniprot_entries (uniprot_entry_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to assemblies"
echo "ALTER TABLE assemblies ADD INDEX fk_taxons_assemblies_idx (taxon_id ASC);" | mysql -u unipept -punipept unipept

print "adding index to assembly_sequences"
echo "ALTER TABLE assembly_sequences ADD INDEX fk_assemblies_assembly_sequences_idx (assembly_id ASC);" | mysql -u unipept -punipept unipept
echo "ALTER TABLE assembly_sequences ADD INDEX idx_genbank_accession (genbank_accession ASC);" | mysql -u unipept -punipept unipept
