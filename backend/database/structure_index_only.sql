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
ALTER TABLE sequences ADD INDEX fk_sequences_ec_numbers (ec_lca ASC), ADD INDEX fk_sequences_ec_numbers_2 (ec_lca_il ASC);


-- -----------------------------------------------------
-- Table `unipept`.`ec_numbers`
-- -----------------------------------------------------
ALTER TABLE ec_numbers ADD UNIQUE INDEX uidx_ec_number (ec_number ASC);


-- -----------------------------------------------------
-- Table `unipept`.`go_terms`
-- -----------------------------------------------------
ALTER TABLE go_terms ADD UNIQUE INDEX uidx_go_id (go_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`interpro_entries`
-- -----------------------------------------------------
ALTER TABLE interpro_entries ADD UNIQUE INDEX uidx_interpro_id (interpro_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`kegg_pathways`
-- -----------------------------------------------------
ALTER TABLE kegg_pathways ADD UNIQUE INDEX uidx_long_id (long_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`go_lcas`
-- -----------------------------------------------------
ALTER TABLE go_lcas ADD INDEX fk_go_lcas_sequences (sequence_id ASC), ADD INDEX fk_go_lcas_go_terms (go_lca ASC), ADD INDEX fk_go_lcas_go_terms_2 (go_lca_il ASC);


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
ALTER TABLE go_cross_references ADD INDEX fk_go_reference_uniprot_entries (uniprot_entry_id ASC), ADD INDEX fk_go_reference_go_terms (go_term_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`ec_cross_references`
-- -----------------------------------------------------
ALTER TABLE ec_cross_references ADD INDEX fk_ec_reference_uniprot_entries (uniprot_entry_id ASC), ADD INDEX fk_ec_reference_ec_numbers (ec_number_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`interpro_cross_references`
-- -----------------------------------------------------
ALTER TABLE interpro_cross_references ADD INDEX fk_interpro_reference_uniprot_entries (uniprot_entry_id ASC), ADD INDEX fk_interpro_reference_interpro_entries (interpro_entry_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`interpro_to_gos`
-- -----------------------------------------------------
ALTER TABLE interpro_to_gos ADD INDEX fk_interpro_entries_has_go_terms_go_terms (go_term_id ASC), ADD INDEX fk_interpro_entries_has_go_terms_interpro_entries (interpro_entry_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`proteomes`
-- -----------------------------------------------------
ALTER TABLE proteomes ADD INDEX fk_taxons_proteomes (taxon_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`proteome_cross_references`
-- -----------------------------------------------------
ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references_uniprot_entries (uniprot_entry_id ASC);
ALTER TABLE proteome_cross_references ADD INDEX fk_proteome_cross_references (proteome_id ASC);


-- -----------------------------------------------------
-- Table `unipept`.`kegg_pathway_mappings`
-- -----------------------------------------------------
ALTER TABLE kegg_pathway_mappings ADD INDEX fk_kegg_pathways (kegg_pathway_id ASC);
ALTER TABLE kegg_pathway_mappings ADD INDEX fk_ec_numbers (ec_number_id ASC);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
