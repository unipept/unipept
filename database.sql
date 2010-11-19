delimiter $$

CREATE DATABASE `unipept` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$

CREATE TABLE `organism` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `peptide` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequenceId` int(11) NOT NULL,
  `organismId` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`sequenceId`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2219697 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sequence` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_UNIQUE` (`sequence`) USING BTREE,
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=343308 DEFAULT CHARSET=utf8$$

