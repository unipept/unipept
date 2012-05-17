#backup old database
ssh -p 4840 bmesuere@nibbler.ugent.be "mysqldump -u unipept -p --opt unipept | gzip - > dump.old.sql.gz"

#dump new database
ssh -p 4840 bmesuere@scruffy.ugent.be "mysqldump -u unipept -p --opt unipept | gzip - > dump.sql.gz"

#transfer new db to local pc
scp -P 4840 bmesuere@scruffy.ugent.be:dump.sql.gz .

#transfer new db to nibbler
scp -P 4840 dump.sql.gz bmesuere@nibbler.ugent.be:dump.new.sql.gz

#load new database
ssh -p 4840 bmesuere@nibbler.ugent.be "gunzip < dump.new.sql.gz | mysql -u unipept -p unipept < -"