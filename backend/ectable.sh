#!/bin/bash
 
cat $1 | sed -e "s/- /-    /" | awk -v VAR="$VAR++" 'BEGIN {
	FS = "    "
	VAR++
} /^[1-9]\./ {
	gsub(/ /, "", $1)
	gsub(/^ */, "", $2)
	printf("%d\t%s\t%s\n", VAR++, $1, $2)
} END {
}'

VAR=$(grep "^[1-9]" enzclass.txt | wc -l | awk '{print $1}')

cat $2 | awk -v VAR="$VAR" 'BEGIN {
	FS = "   "
	VAR++
} /^ID/{
	if (id != "") {
    printf("%d\t%s\t%s\n", VAR++, id, name)
} 
	name = ""
	id = $2
} /^DE/{
	gsub(/.$/, "", $2)
	name = name $2
} END {
	printf("%d\t%s\t%s\n", VAR++, id, name)
}'
