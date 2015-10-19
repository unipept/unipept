SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

-- -----------------------------------------------------
-- Table `unipept`.`taxons`
-- -----------------------------------------------------
ALTER TABLE taxons ADD INDEX fk_taxon_taxon (parent_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`uniprot_entries`
-- -----------------------------------------------------
ALTER TABLE uniprot_entries ADD INDEX fk_uniprot_entries_taxons (taxon_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`lineages`
-- -----------------------------------------------------
ALTER TABLE lineages ADD INDEX idx_species (species ASC);


-- -----------------------------------------------------
-- Table `unipept`.`sequences`
-- -----------------------------------------------------
ALTER TABLE sequences ADD UNIQUE INDEX idx_sequences (sequence ASC);
ALTER TABLE sequences ADD INDEX fk_sequences_taxons (lca ASC), ADD INDEX fk_sequences_taxons_2 (lca_il ASC);


-- -----------------------------------------------------
-- Table `unipept`.`peptides`
-- -----------------------------------------------------
ALTER TABLE peptides ADD INDEX fk_peptides_sequences (sequence_id ASC), ADD INDEX fk_peptides_uniprot_entries (uniprot_entry_id ASC), ADD INDEX fk_peptides_original_sequences (original_sequence_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`embl_cross_references`
-- -----------------------------------------------------
ALTER TABLE embl_cross_references ADD INDEX fk_embl_reference_uniprot_entries (uniprot_entry_id ASC), ADD INDEX idx_sequence_id (sequence_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`refseq_cross_references`
-- -----------------------------------------------------
ALTER TABLE refseq_cross_references ADD INDEX fk_refseq_reference_uniprot_entries (uniprot_entry_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`go_cross_references`
-- -----------------------------------------------------
ALTER TABLE go_cross_references ADD INDEX fk_go_reference_uniprot_entries (uniprot_entry_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`ec_cross_references`
-- -----------------------------------------------------
ALTER TABLE ec_cross_references ADD INDEX fk_ec_reference_uniprot_entries (uniprot_entry_id ASC);
ALTER TABLE ec_cross_references ADD INDEX fk_ec_cross_reference_ec_numbers_idx (ec_number ASC);


-- -----------------------------------------------------
-- Table `unipept`.`assemblies`
-- -----------------------------------------------------
ALTER TABLE assemblies ADD INDEX fk_taxons_assemblies_idx (taxon_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`assembly_sequences`
-- -----------------------------------------------------
ALTER TABLE assembly_sequences ADD INDEX fk_assemblies_assembly_sequences_idx (assembly_id ASC);
ALTER TABLE assembly_sequences ADD INDEX idx_genbank_accession (genbank_accession ASC);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
