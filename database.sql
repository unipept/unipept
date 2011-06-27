SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `unipept` DEFAULT CHARACTER SET utf8 ;
USE `unipept` ;

-- -----------------------------------------------------
-- Table `unipept`.`taxons`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`taxons` (
  `id` MEDIUMINT UNSIGNED NOT NULL ,
  `name` VARCHAR(256) NOT NULL ,
  `rank` ENUM('no rank', 'superkingdom', 'kingdom', 'subkingdom', 'superphylum', 'phylum', 'subphylum', 'superclass', 'class', 'subclass', 'infraclass', 'superorder', 'order', 'suborder', 'infraorder', 'parvorder', 'superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species group', 'species subgroup', 'species', 'subspecies', 'varietas', 'forma' ) NULL DEFAULT NULL ,
  `parent_id` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_taxon_taxon` (`parent_id` ASC) ,
  CONSTRAINT `fk_taxon_taxon`
    FOREIGN KEY (`parent_id` )
    REFERENCES `unipept`.`taxons` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`uniprot_entries`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`uniprot_entries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_accession_number` VARCHAR(8) NOT NULL ,
  `version` SMALLINT UNSIGNED NOT NULL ,
  `taxon_id` MEDIUMINT UNSIGNED NOT NULL ,
  `type` ENUM('swissprot', 'trembl') NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_uniprot_entries_taxons` (`taxon_id` ASC) ,
  CONSTRAINT `fk_uniprot_entries_taxons`
    FOREIGN KEY (`taxon_id` )
    REFERENCES `unipept`.`taxons` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1136
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`lineages`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`lineages` (
  `taxon_id` MEDIUMINT UNSIGNED NOT NULL ,
  `superkingdom` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `kingdom` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subkingdom` MEDIUMINT UNSIGNED NULL ,
  `superphylum` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `phylum` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subphylum` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `superclass` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `class` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subclass` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `infraclass` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `superorder` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `order` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `suborder` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `infraorder` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `parvorder` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `superfamily` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `family` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subfamily` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `tribe` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subtribe` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `genus` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subgenus` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `species_group` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `species_subgroup` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `species` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `subspecies` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `varietas` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `forma` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  PRIMARY KEY (`taxon_id`) ,
  INDEX `fk_lineages_taxons` (`taxon_id` ASC) ,
  CONSTRAINT `fk_lineages_taxons`
    FOREIGN KEY (`taxon_id` )
    REFERENCES `unipept`.`taxons` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`sequences`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`sequences` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `sequence` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `uidx_sequence` (`sequence` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 17232835
DEFAULT CHARACTER SET = ascii;


-- -----------------------------------------------------
-- Table `unipept`.`peptides`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`peptides` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `sequence_id` INT UNSIGNED NOT NULL ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_peptides_sequences` (`sequence_id` ASC) ,
  INDEX `fk_peptides_uniprot_entries` (`uniprot_entry_id` ASC) ,
  CONSTRAINT `fk_peptides_sequences`
    FOREIGN KEY (`sequence_id` )
    REFERENCES `unipept`.`sequences` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_peptides_uniprot_entries`
    FOREIGN KEY (`uniprot_entry_id` )
    REFERENCES `unipept`.`uniprot_entries` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 26402948
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`uniprot_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`uniprot_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `sequence_id` VARCHAR(15) NULL ,
  `protein_id` VARCHAR(15) NULL ,
  `type` ENUM('refseq', 'EMBL') NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_uniprot_cross_reference_uniprot_entries` (`uniprot_entry_id` ASC) ,
  CONSTRAINT `fk_uniprot_cross_reference_uniprot_entries`
    FOREIGN KEY (`uniprot_entry_id` )
    REFERENCES `unipept`.`uniprot_entries` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
