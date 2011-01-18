delimiter $$

CREATE DATABASE `unipept` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$

CREATE TABLE `organisms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `taxon_id` int(11) NOT NULL,
  `species_id` int(11) NOT NULL,
  `genus_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `index2` (`taxon_id`),
  KEY `index3` (`species_id`),
  KEY `index4` (`genus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `peptides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence_id` int(11) NOT NULL,
  `organism_id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`sequence_id`),
  KEY `index3` (`organism_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sequences` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_UNIQUE` (`sequence`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `taxon_names` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tax_id` int(11) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`tax_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `taxon_nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tax_id` int(11) NOT NULL,
  `parentTax_id` int(11) DEFAULT NULL,
  `rank` varchar(45) DEFAULT NULL,
  `geneticCode` int(11) DEFAULT NULL,
  `mitoCode` int(11) DEFAULT NULL,
  `isTaxonHidden` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

