# first transpose in excel and paste in new document
# on client
awk '{print > $1".input";close($1);}' transpose_input.txt
for f in *.input; do gsed -i "s/\t/\n/g" $f; gsed -i "1d" $f; done

# on server
for f in *.input; do ./tools/scripts/batchSearch.sh $f $f".output"; done
tar -zcvf output.tar.gz griet

# on client
for f in *.output; do cat $f | sed '1d' | sed 's/^[^,]*,*//' | sed 's/,""//g' | sort | uniq -c | sed 's/^ *\([0-9]*\) \(.*\)$/\2;\1/' > $f".grouped"; done
cat *.grouped | sed 's/;.*//' | sort | uniq > masterfile.txt

for f in *.grouped; do join -t";" -a1 -o "0 2.2" -e "0" masterfile.txt $f | sed "s/0;/root;/" > $f".merged" ; done
sed "s/^$/root/" masterfile.txt > merge.txt
echo -n ";" > files.txt ; for f in *.merged; do join -t ";" merge.txt $f > temp.txt ; cp temp.txt merge.txt ; echo -n $f";" >> files.txt ; done; rm temp.txt

sed "s/.input.output.grouped.merged//g" files.txt > output.txt ; cat merge.txt >> output.txt; rm files.txt merge.txt
