delimiter $$

CREATE DATABASE `unipept` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$

CREATE TABLE `organism` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `taxonId` int(11) NOT NULL,
  `speciesId` int(11) NOT NULL,
  `genusId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `index2` (`taxonId`),
  KEY `index3` (`speciesId`),
  KEY `index4` (`genusId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `peptide` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequenceId` int(11) NOT NULL,
  `organismId` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`sequenceId`) USING BTREE,
  KEY `index3` (`organismId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sequence` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_UNIQUE` (`sequence`) USING BTREE,
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=343308 DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `taxon_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `taxId` int(11) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `nameClass` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`taxId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `taxon_node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `taxId` int(11) NOT NULL,
  `parentTaxId` int(11) DEFAULT NULL,
  `rank` varchar(45) DEFAULT NULL,
  `geneticCode` int(11) DEFAULT NULL,
  `mitoCode` int(11) DEFAULT NULL,
  `isTaxonHidden` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=227766 DEFAULT CHARSET=utf8$$

