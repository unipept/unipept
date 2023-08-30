<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap splitkmers
        </h1>
        <h3 class="font-weight-light">
            Splits a <initialism>TSV</initialism> stream of peptides and taxon IDs into k-mers and taxon IDs
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap splitkmers</inline-code> command takes tab-separated taxon IDs and protein sequences and outputs the k-mers
            mapped to the taxon IDs.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i> and should be a <initialism>TSV</initialism> formatted stream of taxon IDs and a protein sequence
                from this taxon. The output will be written to <i>standard output</i> and consists of a <initialism>TSV</initialism> formatted stream of k-mers
                mapped to the taxa in which they occur. The k-mer length is configurable with the <inline-code>-k</inline-code> option, and is 9 by default.
            </p>

            <p>
                This output stream is ready to be grouped by K-mer by sorting and then aggregated into a searchable index, with the
                <inline-code>sort</inline-code>, <inline-code>umgap joinkmers</inline-code> and <inline-code>umgap buildindex</inline-code> commands.
            </p>

            <boxed style="max-height: fit-content;">
<pre>
<sentinel>$</sentinel> <b>cat input.tsv</b>
654924	MNAKYDTDQGVGRMLFLGTIGLAVVVGGLMAYGYYYDGKTPSSGTSFHTASPSFSSRYRY
176652	MIKLFCVLAAFISINSACQSSHQQREEFTVATYHSSSICTTYCYSNCVVASQHKGLNVESYTCDKPDPYGRETVCKCTLIKCHDI
<sentinel>$</sentinel> <b>umgap splitkmers &lt; input.tsv</b>
MNAKYDTDQ	654924
NAKYDTDQG	654924
AKYDTDQGV	654924
KYDTDQGVG	654924
YDTDQGVGR	654924
...
SPSFSSRYR	654924
PSFSSRYRY	654924
MIKLFCVLA	176652
IKLFCVLAA	176652
KLFCVLAAF	176652
...
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
    { name: "-k / --length k", description: "The k-mer length [default: 9]" },
    { name: "-p / --prefix p", description: "Print only the (k-1)-mer suffixes of the k-mers starting with this character" }
];
</script>
