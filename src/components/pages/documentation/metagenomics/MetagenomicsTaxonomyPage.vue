<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap taxonomy
        </h1>
        <h3 class="font-weight-light">
            Includes the taxonomic information in a stream of <initialism>NCBI</initialism> taxon IDs
        </h3>

        <v-divider class="my-2" />

        <p>
            The umgap taxonomy command takes one or more <initialism>NCBI</initialism> taxon IDs as input, searches for them in the taxonomy and outputs more
            information about them in a <initialism>TSV</initialism> format.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i> and may be any sequence of <initialism>FASTA</initialism> headers and/or lines containing a single
                <initialism>NCBI</initialism> taxon ID. A <initialism>TSV</initialism> header is printed to <i>standard output</i>. The <initialism>FASTA</initialism> headers (any line
                starting with a <inline-code>></inline-code>) are just copied over. Each of the taxon IDs on the other lines is looked up in a
                taxonomy, and the ID, name and rank of the taxon are written out separated by tabs.
            </p>

            <p>
                A taxonomy file must be passed as argument.
            </p>

            <boxed style="max-height: fit-content;">
                <pre>
<sentinel>$</sentinel> <b>cat input.txt</b>
2026807
888268
186802
1598
1883
<sentinel>$</sentinel> <b>umgap taxonomy taxons.tsv &lt; input.fa</b>
taxon_id	taxon_name	taxon_rank
2026807	Zetaproteobacteria bacterium	species
888268	Dichanthelium oligosanthes	species
186802	Clostridiales	order
1598	Lactobacillus reuteri	species
1883	Streptomyces	genus
</pre>
            </boxed>

            <p>
                The <inline-code>-H</inline-code> flag can be used to suppress the <initialism>TSV</initialism> header, for instance when dealing with <initialism>FASTA</initialism> input.
            </p>

            <boxed>
                <pre>
<sentinel>$</sentinel> <b>cat input2.fa</b>
>header1
2026807
888268
186802
1598
1883
<sentinel>$</sentinel> <b>umgap taxonomy -H taxons.tsv &lt; input2.fa</b>
>header1
2026807	Zetaproteobacteria bacterium	species
888268	Dichanthelium oligosanthes	species
186802	Clostridiales	order
1598	Lactobacillus reuteri	species
1883	Streptomyces	genus
</pre>
            </boxed>

            <p>
                The <inline-code>-a</inline-code> flag can be used to request a complete ranked lineage.
            </p>

            <boxed>
                <pre>
<sentinel>$</sentinel> <b>cat input3.fa</b>
888268
<sentinel>$</sentinel> <b>umgap taxonomy -a taxons.tsv &lt; input3.fa</b>
taxon_id	taxon_name	taxon_rank	domain_id	domain_name	realm_id	realm_name    kingdom_id	kingdom_name	subkingdom_id	subkingdom_name	superphylum_id	superphylum_name	phylum_id	phylum_name	subphylum_id	subphylum_name	superclass_id	superclass_name	class_id	class_name	subclass_id	subclass_name	infraclass_id	infraclass_name	superorder_id	superorder_name	order_id	order_name	suborder_id	suborder_name	infraorder_id	infraorder_name	parvorder_id	parvorder_name	superfamily_id	superfamily_name	family_id	family_name	subfamily_id	subfamily_name	tribe_id	tribe_name	subtribe_id	subtribe_name	genus_id	genus_name	subgenus_id	subgenus_name	species_group_id	species_group_name	species_subgroup_id	species_subgroup_name	species_id	species_name	subspecies_id	subspecies_name	varietas_id	varietas_name	forma_id	forma_name
888268	Dichanthelium oligosanthes	species	2759	Eukaryota	33090	Viridiplantae					35493	Streptophyta	131221	Streptophytina			3398	Magnoliopsida	1437197	Petrosaviidae					38820	Poales									4479	Poaceae	147369	Panicoideae	147428	Paniceae	1648011	Dichantheliinae	161620	Dichanthelium							888268	Dichanthelium oligosanthes
</pre>
            </boxed>

            <parameter-table
                class="mt-5 mb-3"
                :parameters="usageParameters"
            />
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import InlineCode from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import ParameterTable from '@/components/tables/ParameterTable.vue';

const usageParameters = [
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-a / --all", description: "Show the full lineage of a taxon" },
    { name: "-H / --no-header", description: "Do not output the TSV header" }
];
</script>
