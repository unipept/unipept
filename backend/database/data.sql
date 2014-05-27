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

-- -----------------------------------------------------
-- Data for table `unipept`.`users`
-- -----------------------------------------------------
START TRANSACTION;
USE `unipept`;
INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (1, 'bmesuere', 1);
INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (2, 'pdawyndt', 1);

COMMIT;

