delimiter $$

CREATE DATABASE `unipept` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$
CREATE TABLE `genbank_files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` varchar(32) NOT NULL,
  `accession_number` varchar(32) NOT NULL,
  `draft` bit(1) NOT NULL DEFAULT b'0',
  `taxon_id` int(11) NOT NULL,
  `hash` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_id` (`id`),
  KEY `idx_taxon_id` (`taxon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$
CREATE TABLE `peptides` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` int(11) NOT NULL,
  `genbank_file_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_id` (`id`),
  KEY `idx_sequence_id` (`sequence_id`),
  KEY `idx_genbank_file_id` (`genbank_file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$
CREATE TABLE `sequences` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_sequence` (`sequence`),
  UNIQUE KEY `uidx_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36293784 DEFAULT CHARSET=utf8$$

delimiter $$
CREATE TABLE `taxons` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `rank` varchar(16) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$
CREATE TABLE `lineages` (
  `taxon_id` int(11) unsigned NOT NULL,
  `superkingdom` int(11) unsigned DEFAULT NULL,
  `kingdom` int(11) unsigned DEFAULT NULL,
  `superphylum` int(11) unsigned DEFAULT NULL,
  `phylum` int(11) unsigned DEFAULT NULL,
  `subphylum` int(11) unsigned DEFAULT NULL,
  `superclass` int(11) unsigned DEFAULT NULL,
  `class` int(11) unsigned DEFAULT NULL,
  `subclass` int(11) unsigned DEFAULT NULL,
  `infraclass` int(11) unsigned DEFAULT NULL,
  `superorder` int(11) unsigned DEFAULT NULL,
  `order` int(11) unsigned DEFAULT NULL,
  `suborder` int(11) unsigned DEFAULT NULL,
  `infraorder` int(11) unsigned DEFAULT NULL,
  `parvorder` int(11) unsigned DEFAULT NULL,
  `superfamily` int(11) unsigned DEFAULT NULL,
  `family` int(11) unsigned DEFAULT NULL,
  `subfamily` int(11) unsigned DEFAULT NULL,
  `tribe` int(11) unsigned DEFAULT NULL,
  `subtribe` int(11) unsigned DEFAULT NULL,
  `genus` int(11) unsigned DEFAULT NULL,
  `subgenus` int(11) unsigned DEFAULT NULL,
  `species_group` int(11) unsigned DEFAULT NULL,
  `species_subgroup` int(11) unsigned DEFAULT NULL,
  `species` int(11) unsigned DEFAULT NULL,
  `subspecies` int(11) unsigned DEFAULT NULL,
  `varietas` int(11) unsigned DEFAULT NULL,
  `forma` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`taxon_id`),
  UNIQUE KEY `id_UNIQUE` (`taxon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

