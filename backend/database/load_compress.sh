#!/bin/bash
# extracts all .tsv.gz files, imports them into the unipept database
# and removes the files

db=unipept

function print {
    echo "$(date +"%D %T") $1"
}

function perform {
    print "    zcat $1 |"
    print "    $2"
    zcat "$1" | mysql  --local-infile=1 -uunipept -punipept $db -e "$2 ;SHOW WARNINGS" 2>&1
}

print "start"
for file in ${@:-$(ls *.tsv.gz)}
do
    print $file
    tbl=`basename $file | sed "s/.tsv.gz//"`
    case "$tbl" in
    "sequences")
        print "  -> Special ingest sequences started ($tbl""_compressed)"
        perform $file "LOAD DATA LOCAL INFILE '/dev/stdin' INTO TABLE $tbl""_compressed (id,sequence,lca,lca_il,@ffa,@ffa_il) SET fa=COMPRESS(@ffa), fa_il=COMPRESS(@ffa_il)"
        ;;
    *)
        print "  -> Normal ingest started"
        perform $file "LOAD DATA LOCAL INFILE '/dev/stdin' INTO TABLE $tbl"
        ;;
    esac
    print "  -> done with $tbl"
done
print "done"
