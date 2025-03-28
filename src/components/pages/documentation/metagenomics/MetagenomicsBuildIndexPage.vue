<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap buildindex
        </h1>
        <h3 class="font-weight-light">
            Builds an index mapping short strings to taxon IDs
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap buildindex</inline-code> command takes tab-separated strings and taxon IDs, and creates a finite state transducer
            (<initialism>FST</initialism>) of this mapping.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i>. It should be in a <initialism>TSV</initialism> format with two columns, ordered by the first.
                The unique strings in the first column should be mapped to the integers (taxon IDs) in the second column. A binary
                file with a compressed mapping is written to <i>standard output</i>.
            </p>

            <boxed style="max-height: fit-content;">
                <pre>
<sentinel>$</sentinel> <b>cat input.tsv</b>
AAAAA	2759
BBBBBB	9153
<sentinel>$</sentinel> <b>umgap buildindex &lt; input.tsv > tiny.index</b>
<sentinel>$</sentinel> <b>umgap printindex tiny.index</b>
AAAAA	2759
BBBBBB	9153
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
