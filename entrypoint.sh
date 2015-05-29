#!/bin/bash

# Sourcing rvm
. /etc/profile.d/rvm.sh

# Database setup
rake db:setup

files=(
    "ec_cross_references.tsv"
    "embl_cross_references.tsv"
    "go_cross_references.tsv"
    "lineages.tsv"
    "peptides.tsv"
    "refseq_cross_references.tsv"
    "sequences.tsv"
    "taxons.tsv"
    "uniprot_entries.tsv"
)

route -n
gateway="$(route -n | grep '^0.0.0.0' | sed 's/  */	/g' | cut -f2)"

for file in "${files[@]}"; do
    echo "$file"
    curl -q "$gateway:8000/$file" > "$file"
    sed -i '1d' "$file"
    mysqlimport --user=unipept -punipept   \
        --host="$MYSQL_PORT_3306_TCP_ADDR" \
        --port="$MYSQL_PORT_3306_TCP_PORT" \
        --local unipept "$file"
    rm "$file"
done

passenger start -a 0.0.0.0 -p 80 -e production
