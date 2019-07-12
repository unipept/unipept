#!/bin/bash 

service mysql start
mysql < init_db.sql

cd /unipept/backend

sed -i '/checkdep build-index/d' configure
cat wizard_answers.txt | ./configure
make

service mysql stop
