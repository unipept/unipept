#!/bin/bash

database="unipept2"
tabledir=`find . -name "tables-*" | sort | tail -1 | sed "s/^..//"`

echo "This script will load the files from $tabledir into $database."
read -p "Do you want to continue? (y/n) " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cp load.sh $tabledir
    cp index.sh $tabledir
    cd $tabledir
    echo "dropping tables"
    find . -name "*.tsv.gz" | sed "s/..\(.*\)\.tsv\.gz/\1/" | tr "\n" "," | sed "s/,/, /g" | sed "s/^/drop table /" | sed "s/, $/;/" | mysql -u unipept -punipept $database

    echo "creating database"
    cat ../structure_no_index.sql | sed "s/unipept/$database/" | mysql -u unipept -punipept $database

    echo "loading data"
    ./load.sh $database

    echo "indexing data"
    ./index.sh $database
fi
