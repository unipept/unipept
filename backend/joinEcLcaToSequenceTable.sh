i=5
orderl='0,1.2,1.3,1.4'
orderr=',2.2'

sequence_lca=$1
ec_lca=$2
ec_lcail=$3
output=$4
tmp_path=$5
first="true"

declare -a files=($sequence_lca $ec_lca $ec_lcail)

for k in "${files[@]}"
do
    if [ -a $output ] && [ $first = "false" ]
    then
            gjoin -t $'\t' -a1 -a2 -e "\\N" -o "$orderl$orderr" <(gzcat $output) <(gzcat $k) | gzip - > $tmp_path/tmp.tsv.gz
            orderl="$orderl,1.$i"
            i=$((i+1))
            mv $tmp_path/tmp.tsv.gz $output
    else
            cp $k $output
	    first="false"
    fi
done
