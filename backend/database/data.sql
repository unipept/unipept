-- -----------------------------------------------------
-- Data for table `unipept`.`users`
-- -----------------------------------------------------
START TRANSACTION;
USE `unipept`;
INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (1, 'bmesuere', 1);
INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (2, 'pdawyndt', 1);
INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (3, 'guest', 0);

COMMIT;

