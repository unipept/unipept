#!/bin/bash
# Downloads the enzymes.dat file and loads them into the ec_numbers table

mkdir ../../../data/ecnumbers
datadir="../../../data/ecnumbers"
currentdir=`pwd`

# prepare the sql file
cd "${datadir}"
rm -f enzyme.dat
rm -f enzyme.sql
wget ftp://ftp.expasy.org/databases/enzyme/enzyme.dat
echo "TRUNCATE TABLE ec_numbers;" > enzyme.sql
awk 'BEGIN {
  FS = "   "
}
/^ID/{
  if (id != "") {
    printf("INSERT INTO ec_numbers (number, name) VALUES (\"%s\", \"%s\");\n", id, name)
  }
  name = ""
  id = $2
}
/^DE/{
  gsub(/.$/, "", $2)
  name = name $2
}
END {
  printf("INSERT INTO ec_numbers (number, name) VALUES (\"%s\", \"%s\");\n", id, name)
}' enzyme.dat >> enzyme.sql

# load the file into the database
#echo "loading the database"
#mysql -u unipept -punipept unipept < "enzyme.sql"

#cd "${currentdir}"
