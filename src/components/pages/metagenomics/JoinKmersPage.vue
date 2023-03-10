<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap joinkmers
        </h1>
        <h3 class="font-weight-light">Aggregates a <Initialism>TSV</Initialism> stream of peptides and taxon IDs</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap joinkmers</Code> command takes tab-separated peptides and taxon IDs, aggregates the taxon IDs where 
            consecutive peptides are equal and outputs a tab-separated triple of peptide, consensus taxon ID and taxon rank.
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given on <i>standard input</i>. If it is sorted on the first column, a complete mapping from strings to 
                aggregated taxa and its rank will be written to <i>standard output</i>. It is meant to be used after the 
                <Code>umgap splitkmers</Code> and <Code>sort</Code> commands, and it's output is ideal for <Code>umgap buildindex</Code>, 
                but there may be further uses.
            </p>

            <p>
                The aggregation strategy used in this command to find a consensus taxon is the hybrid approach of the <Code>umgap taxa2agg</Code> 
                command, with a 95% factor. This keeps the result close to the lowest common ancestor, but filters out some outlying taxa.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <Initialism>NCBI</Initialism> taxonomy.
            </p>

            <Boxed style="max-height: fit-content;">
<pre>
<Sentinel>$</Sentinel> <b>cat input.tsv</b>
AAAAA	34924
AAAAA	30423
AAAAA	5678
BBBBBB	48890
BBBBBB	156563
<Sentinel>$</Sentinel> <b>umgap joinkmers taxons.tsv &lt; input.tsv</b>
AAAAA	2759	superkingdom
BBBBBB	9153	family
</pre>
            </Boxed>

            <ParameterTable class="mt-5 mb-3" :parameters="usageParameters" />
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import Code from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import ParameterTable from '@/components/tables/ParameterTable.vue';

const usageParameters = [    
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" }
];
</script>
