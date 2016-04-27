i=5
orderl='0,1.2,1.3,1.4'
orderr=',2.2'

declare -a files=("../../data/intermediate/sequences_lca.tsv.gz" "../../data/intermediate/ec_cross_references_lca.tsv.gz" "../../data/intermediate/ec_cross_references_lca_il.tsv.gz" "../../data/intermediate/go_cross_references_lca.tsv.gz" "../../data/intermediate/go_cross_references_lca_il.tsv.gz" "../../data/intermediate/interpro_cross_references_lca.tsv.gz" "../../data/intermediate/interpro_cross_references_lca_il.tsv.gz")

for k in "${files[@]}"
do
    if [ -a ../../data/tables/sequences.tsv.gz ]
    then
            join -t $'\t' -a1 -a2 -e "\\\N" -o "$orderl$orderr" <(gzcat ../../data/tables/sequences.tsv.gz \
            	| sort -k1,1n) <(gzcat $k | sort -k1,1n) | gzip > ../../data/intermediate/tmp.tsv.gz
            orderl="$orderl,1.$i"
            i=$((i+1))
            mv ../../data/intermediate/tmp.tsv.gz ../../data/tables/sequences.tsv.gz
    else
            cp $k ../../data/tables/sequences.tsv.gz
    fi
done
