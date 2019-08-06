#!/bin/bash 
cd /backend

# First the database structure should be initialized
cp database/structure_no_index.sql /docker-entrypoint-initdb.d/1.sql

# Then, we start processing all data for the database
if test -f "/tables/peptides.tsv.gz"; then
    echo "No need to regenerate data. Previously generated data encountered."
else
    echo "Data needs to be regenerated."
    sed -i '/checkdep umgap/d' configure
    ./script.exp
    make

    mv -a /backend/data/tables/. /tables/.
fi

# All necessary data has been generated at this point, and data can be inserted into the database when the container starts.
# The data that has been generated can be found in the /backend/data/tables folder and should be loaded into the database by using the load.sh script

