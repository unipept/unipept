#!/bin/bash

# Move to the backend-folder in which all database-generation files live.
cd /unipept/backend

mkdir -p data/tables

# First the database structure should be initialized when the container starts up for the first time
cp database/structure_no_index.sql /docker-entrypoint-initdb.d/1.sql

# Then, we start processing all data for the database. If the required data files have been generated before, we don't
# need to redo these! (TODO: we could check if *all* required .tsv.gz files are present in case the database format
# was changed!)
if test -f "/tables/uniprot_entries.tsv.gz"; then
    echo "No need to regenerate data. Previously generated data encountered."
else
    echo "Data needs to be regenerated."
    # The generation of umgap-data is not supported at this time by this Docker container.
    sed -i '/checkdep umgap/d' configure
    sed -i '/all: makefile database index/d' makefile.in
    cp /scripts/script.exp script.exp
    chmod +x script.exp
    chmod +x configure
    ./script.exp
    make

    # Move the data that has been generated to the tables volume. If this file is rerun afterwards, the data does not
    # need to be regenerated.
    mkdir /tables
    mv /unipept/backend/data/tables/* /tables
fi

# All necessary data has been generated at this point, and data can be inserted into the database when the container 
# starts. The generated data can be found in the /tables folder and should be loader into the database by using the
# load.sh-script that's automatically called when the container starts.
