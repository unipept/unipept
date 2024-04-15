<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap translate
        </h1>
        <h3 class="font-weight-light">
            Translates a <initialism>FASTA</initialism> stream of <initialism>DNA</initialism> reads to peptides
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap translate</inline-code> command takes one or more <initialism>DNA</initialism> sequences and translates them into amino acid sequences
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The <initialism>DNA</initialism> sequences are expected in a <initialism>FASTA</initialism> format on <i>standard input</i>.
            </p>

            <boxed>
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>GATTACAAA
                <br><sentinel>$</sentinel> <b>umgap translate -f1 &lt; input.fa</b>
                <br>>header1
                <br>DYK
            </boxed>

            <p>
                The <inline-code>-f</inline-code> flag allows you to add reading frames to the translation. If you want to translate multiple frames
                and care to keep them apart, the <inline-code>-n</inline-code> flag adds the name of the frame to the end of the <initialism>FASTA</initialism> header.
            </p>

            <boxed style="max-height: fit-content">
                <sentinel>$</sentinel> <b>umgap translate -f1 -f1R &lt; input.fa</b>
                <br>>header1|1
                <br>DYK
                <br>>header1|1R
                <br>FVI
            </boxed>

            <p>
                The <inline-code>-a</inline-code> flag can be used as a shortcut to translate all 6 reading frames.
            </p>

            <p>
                With the <inline-code>-t</inline-code> flag, you can select a specific translation table, for instance <inline-code>-t11</inline-code> for the bacterial,
                archaeal and plant plastid code.
            </p>

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
    { name: "-a / --all-frames", description: "Read and output all six frames" },
    { name: "-n / --append-name", description: "Append a bar (|) and the name of the frame to the fasta header" },
    { name: "-h / --help", description: "Prints help information" },
    { name: "-m / --methionine", description: "Replace each start-codon with methionine" },
    { name: "-s / --show-table", description: "Instead of normal use, print the selected table and exit" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-f / --frame f...", description: "Adds a reading frame (1, 2, 3, 1R, 2R or 3R)" },
    { name: "-t / --table t", description: "Translation table to use [default: 1]" },
];
</script>
