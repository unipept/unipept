#!/bin/bash

database="unipept2"
workdir=`find . -name "tables-*" | sort | tail -1 | sed "s/^..//"`

echo "This script will load the files from $workdir into $database."
read -p "Do you want to continue? (y/n) " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
fi
