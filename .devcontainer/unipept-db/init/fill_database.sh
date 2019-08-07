#!/bin/bash

# The database is only filled when no data is already present in the mysql database
result=`mysql $MYSQL_DATABASE -u$MYSQL_USER -p$MYSQL_PASSWORD -N -e "SELECT count(*) FROM taxons;"`
if [ $result -lt 1 ]
then
    cd /tables
    ./load.sh
    cd /backend/database
    # Enable indices on database
    mysql $MYSQL_DATABASE -u$MYSQL_USER -p$MYSQL_PASSWORD < structure_index_only.sql
fi
