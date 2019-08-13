#!/bin/bash
# extracts all .tsv.gz files, imports them into the unipept database
# and removes the files

db=unipept

function print {
    echo $(date -u) $1
}


for file in *.tsv.gz
do
    print $file
    tbl=`echo $file | sed "s/.tsv.gz//"`
    echo "zcatting - LOAD DATA LOCAL INFILE '$file' INTO TABLE $tbl"
    zcat $file | mysql  --local-infile=1 -uunipept -punipept $db -e "LOAD DATA LOCAL INFILE '/dev/stdin' INTO TABLE $tbl;SHOW WARNINGS" 2>&1
done
print "done"
