SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `unipept` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `unipept` ;

-- -----------------------------------------------------
-- Table `unipept`.`taxons`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`taxons` (
  `id` MEDIUMINT UNSIGNED NOT NULL ,
  `name` VARCHAR(120) NOT NULL ,
  `rank` ENUM('no rank', 'superkingdom', 'kingdom', 'subkingdom', 'superphylum', 'phylum', 'subphylum', 'superclass', 'class', 'subclass', 'infraclass', 'superorder', 'order', 'suborder', 'infraorder', 'parvorder', 'superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species group', 'species subgroup', 'species', 'subspecies', 'varietas', 'forma' ) NULL DEFAULT NULL ,
  `parent_id` MEDIUMINT UNSIGNED NULL DEFAULT NULL ,
  `valid_taxon` BIT NOT NULL DEFAULT 1 ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`uniprot_entries`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`uniprot_entries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_accession_number` CHAR(8) ASCII NOT NULL ,
  `version` SMALLINT UNSIGNED NOT NULL ,
  `taxon_id` MEDIUMINT UNSIGNED NOT NULL ,
  `type` ENUM('swissprot', 'trembl') NOT NULL ,
  `protein` TEXT NOT NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


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
  PRIMARY KEY (`taxon_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`sequences`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`sequences` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `sequence` VARCHAR(50) NOT NULL ,
  `lca` MEDIUMINT UNSIGNED NULL ,
  `lca_il` MEDIUMINT UNSIGNED NULL ,
  PRIMARY KEY (`id`))
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
  `position` SMALLINT UNSIGNED NOT NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`embl_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`embl_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `protein_id` VARCHAR(15) NULL ,
  `sequence_id` VARCHAR(15) NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`counters`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`counters` (
  `name` VARCHAR(31) NOT NULL ,
  `value` INT UNSIGNED NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`name`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`datasets`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`datasets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `environment` VARCHAR(160) NULL ,
  `reference` VARCHAR(500) NULL ,
  `url` VARCHAR(200) NULL ,
  `project_website` VARCHAR(200) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`dataset_items`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`dataset_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `dataset_id` INT UNSIGNED NULL ,
  `name` VARCHAR(160) NULL ,
  `data` MEDIUMTEXT CHARACTER SET 'ascii' COLLATE 'ascii_general_ci' NOT NULL ,
  `order` INT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_dataset_items_datasets` (`dataset_id` ASC) ,
  CONSTRAINT `fk_dataset_items_datasets`
    FOREIGN KEY (`dataset_id` )
    REFERENCES `unipept`.`datasets` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`posts`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` VARCHAR(100) NOT NULL ,
  `content` TEXT NOT NULL ,
  `date` DATE NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`genomes`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`genomes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(100) NOT NULL ,
  `bioproject_id` INT UNSIGNED NOT NULL ,
  `insdc_id` VARCHAR(15) NOT NULL ,
  `status` VARCHAR(20) NOT NULL ,
  `taxon_id` MEDIUMINT NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`refseq_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`refseq_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `protein_id` VARCHAR(15) NULL ,
  `sequence_id` VARCHAR(15) NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`go_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`go_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `go_id` VARCHAR(12) NOT NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`ec_cross_references`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`ec_cross_references` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `uniprot_entry_id` INT UNSIGNED NOT NULL ,
  `ec_id` VARCHAR(12) NOT NULL ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`genome_caches`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `unipept`.`genome_caches` (
  `bioproject_id` INT UNSIGNED NOT NULL ,
  `json_sequences` MEDIUMTEXT NOT NULL ,
  PRIMARY KEY (`bioproject_id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = ascii
COLLATE = ascii_general_ci;


-- -----------------------------------------------------
-- Table `unipept`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `unipept`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(8) NOT NULL,
  `admin` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
