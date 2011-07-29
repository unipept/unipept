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
  `valid_taxon` BIT NOT NULL DEFAULT 1 ,
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
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`lineages`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`lineages` (
  `taxon_id` MEDIUMINT UNSIGNED NOT NULL ,
  `superkingdom` MEDIUMINT NULL DEFAULT NULL ,
  `kingdom` MEDIUMINT NULL DEFAULT NULL ,
  `subkingdom` MEDIUMINT NULL DEFAULT NULL ,
  `superphylum` MEDIUMINT NULL DEFAULT NULL ,
  `phylum` MEDIUMINT NULL DEFAULT NULL ,
  `subphylum` MEDIUMINT NULL DEFAULT NULL ,
  `superclass` MEDIUMINT NULL DEFAULT NULL ,
  `class` MEDIUMINT NULL DEFAULT NULL ,
  `subclass` MEDIUMINT NULL DEFAULT NULL ,
  `infraclass` MEDIUMINT NULL DEFAULT NULL ,
  `superorder` MEDIUMINT NULL DEFAULT NULL ,
  `order` MEDIUMINT NULL DEFAULT NULL ,
  `suborder` MEDIUMINT NULL DEFAULT NULL ,
  `infraorder` MEDIUMINT NULL DEFAULT NULL ,
  `parvorder` MEDIUMINT NULL DEFAULT NULL ,
  `superfamily` MEDIUMINT NULL DEFAULT NULL ,
  `family` MEDIUMINT NULL DEFAULT NULL ,
  `subfamily` MEDIUMINT NULL DEFAULT NULL ,
  `tribe` MEDIUMINT NULL DEFAULT NULL ,
  `subtribe` MEDIUMINT NULL DEFAULT NULL ,
  `genus` MEDIUMINT NULL DEFAULT NULL ,
  `subgenus` MEDIUMINT NULL DEFAULT NULL ,
  `species_group` MEDIUMINT NULL DEFAULT NULL ,
  `species_subgroup` MEDIUMINT NULL DEFAULT NULL ,
  `species` MEDIUMINT NULL DEFAULT NULL ,
  `subspecies` MEDIUMINT NULL DEFAULT NULL ,
  `varietas` MEDIUMINT NULL DEFAULT NULL ,
  `forma` MEDIUMINT NULL DEFAULT NULL ,
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
DEFAULT CHARACTER SET = ascii;


-- -----------------------------------------------------
-- Table `unipept`.`peptides`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`peptides` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `sequence_id` INT UNSIGNED NOT NULL ,
  `original_sequence_id` INT UNSIGNED NOT NULL ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_peptides_sequences` (`sequence_id` ASC) ,
  INDEX `fk_peptides_uniprot_entries` (`uniprot_entry_id` ASC) ,
  INDEX `fk_peptides_original_sequences` (`original_sequence_id` ASC) ,
  CONSTRAINT `fk_peptides_sequences`
    FOREIGN KEY (`sequence_id` )
    REFERENCES `unipept`.`sequences` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_peptides_uniprot_entries`
    FOREIGN KEY (`uniprot_entry_id` )
    REFERENCES `unipept`.`uniprot_entries` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_peptides_original_sequences`
    FOREIGN KEY (`original_sequence_id` )
    REFERENCES `unipept`.`sequences` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`uniprot_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`uniprot_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `type` ENUM('RefSeq', 'EMBL') NOT NULL ,
  `protein_id` VARCHAR(15) NULL ,
  `sequence_id` VARCHAR(15) NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_uniprot_cross_reference_uniprot_entries` (`uniprot_entry_id` ASC) ,
  CONSTRAINT `fk_uniprot_cross_reference_uniprot_entries`
    FOREIGN KEY (`uniprot_entry_id` )
    REFERENCES `unipept`.`uniprot_entries` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `unipept`.`counters`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`counters` (
  `name` VARCHAR(31) NOT NULL ,
  `value` INT UNSIGNED NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`name`) )
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `unipept`.`counters`
-- -----------------------------------------------------
START TRANSACTION;
USE `unipept`;
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('sequence_id', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('superkingdom', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('kingdom', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subkingdom', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('superphylum', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('phylum', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subphylum', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('superclass', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('class', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subclass', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('infraclass', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('superorder', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('order', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('suborder', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('infraorder', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('parvorder', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('superfamily', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('family', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subfamily', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('tribe', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subtribe', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('genus', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subgenus', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('species group', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('species subgroup', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('species', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('subspecies', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('varietas', 0);
INSERT INTO `unipept`.`counters` (`name`, `value`) VALUES ('forma', 0);

COMMIT;
