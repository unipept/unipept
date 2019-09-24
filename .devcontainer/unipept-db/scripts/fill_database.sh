#!/bin/bash

# The database is only filled when no data is already present in the mysql database
result=`mysql $MYSQL_DATABASE -u$MYSQL_USER -p$MYSQL_PASSWORD -N -e "SELECT count(*) FROM taxons;"`
if [ $result -lt 1 ]
then
    cp /tables/* /data
    cd /tables
    ./load.sh
    ./index.sh
fi
