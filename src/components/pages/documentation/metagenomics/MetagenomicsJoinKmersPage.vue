<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap joinkmers
        </h1>
        <h3 class="font-weight-light">
            Aggregates a <initialism>TSV</initialism> stream of peptides and taxon IDs
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap joinkmers</inline-code> command takes tab-separated peptides and taxon IDs, aggregates the taxon IDs where
            consecutive peptides are equal and outputs a tab-separated triple of peptide, consensus taxon ID and taxon rank.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i>. If it is sorted on the first column, a complete mapping from strings to
                aggregated taxa and its rank will be written to <i>standard output</i>. It is meant to be used after the
                <inline-code>umgap splitkmers</inline-code> and <inline-code>sort</inline-code> commands, and it's output is ideal for <inline-code>umgap buildindex</inline-code>,
                but there may be further uses.
            </p>

            <p>
                The aggregation strategy used in this command to find a consensus taxon is the hybrid approach of the <inline-code>umgap taxa2agg</inline-code>
                command, with a 95% factor. This keeps the result close to the lowest common ancestor, but filters out some outlying taxa.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <initialism>NCBI</initialism> taxonomy.
            </p>

            <boxed style="max-height: fit-content;">
                <pre>
<sentinel>$</sentinel> <b>cat input.tsv</b>
AAAAA	34924
AAAAA	30423
AAAAA	5678
BBBBBB	48890
BBBBBB	156563
<sentinel>$</sentinel> <b>umgap joinkmers taxons.tsv &lt; input.tsv</b>
AAAAA	2759	superkingdom
BBBBBB	9153	family
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
    { name: "-V / --version", description: "Prints version information" }
];
</script>
