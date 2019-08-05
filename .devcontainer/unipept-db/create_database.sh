#!/bin/bash 

service mysql start
cd backend

mysql < init_db.sql

sed -i '/checkdep umgap/d' configure
./init_makefile.sh
make

service mysql stop
