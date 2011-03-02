delimiter $$

CREATE DATABASE `unipept` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$

CREATE TABLE `organisms` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `taxon_id` int(11) NOT NULL,
  `species_id` int(11) NOT NULL,
  `genus_id` int(11) NOT NULL,
  `draft` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_id` (`id`),
  KEY `idx_taxon_id` (`taxon_id`),
  KEY `idx_species_id` (`species_id`),
  KEY `idx_genus_id` (`genus_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1251 DEFAULT CHARSET=utf8$$



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
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_UNIQUE` (`sequence`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$


delimiter $$

CREATE TABLE `taxons` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `rank` varchar(16) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

