#!/bin/bash
# Parses the ec numbers and names out of 2 source files
# $1 is a file with the ec classes: 
# $2 is a file with the actual ec numbers: ftp://ftp.ebi.ac.uk/pub/databases/enzyme/enzyme.dat

set -e
exec 3>&1

classes="ftp://ftp.ebi.ac.uk/pub/databases/enzyme/enzclass.txt"
numbers="ftp://ftp.ebi.ac.uk/pub/databases/enzyme/enzyme.dat"

lines="$(wget "$classes" -O -          \
       | grep "^[1-9]"                 \
       | sed "s/\. *\([0-9\-]\)/.\1/g" \
       | sed "s/  */\t/"               \
       | nl -n "ln"                    \
       | tee >(cat >&3)                \
       | wc -l                         \
       )"

wget "$numbers" -O - | awk -v lines="$lines" 'BEGIN {
    FS = "   "
    lines++
} /^ID/{
    if (id != "") {
    printf("%d\t%s\t%s\n", lines++, id, name)
}
    name = ""
    id = $2
} /^DE/{
    gsub(/.$/, "", $2)
    name = name $2
} END {
    printf("%d\t%s\t%s\n", lines++, id, name)
}'

