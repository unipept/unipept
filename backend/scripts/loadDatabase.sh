#!/bin/bash
# extracts all .tsv.gz files, imports them and removes the files

function print {
    echo $(date -u) $1
}


for file in *.tsv.gz
do
    print $file
    gunzip $file
    file=`echo $file | sed "s/.gz//"`
    print $file
    mysqlimport -u unipept -punipept --local unipept2 $file
    rm $file
done
