<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap translate
        </h1>
        <h3 class="font-weight-light">Translates a <Initialism>FASTA</Initialism> stream of <Initialism>DNA</Initialism> reads to peptides</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap translate</Code> command takes one or more <Initialism>DNA</Initialism> sequences and translates them into amino acid sequences
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The <Initialism>DNA</Initialism> sequences are expected in a <Initialism>FASTA</Initialism> format on <i>standard input</i>.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>GATTACAAA
                <br><Sentinel>$</Sentinel> <b>umgap translate -f1 &lt; input.fa</b>
                <br>>header1
                <br>DYK
            </Boxed>

            <p>
                The <Code>-f</Code> flag allows you to add reading frames to the translation. If you want to translate multiple frames 
                and care to keep them apart, the <Code>-n</Code> flag adds the name of the frame to the end of the <Initialism>FASTA</Initialism> header.
            </p>

            <Boxed style="max-height: fit-content">
                <Sentinel>$</Sentinel> <b>umgap translate -f1 -f1R &lt; input.fa</b>
                <br>>header1|1
                <br>DYK
                <br>>header1|1R
                <br>FVI
            </Boxed>

            <p>
                The <Code>-a</Code> flag can be used as a shortcut to translate all 6 reading frames.
            </p>

            <p>
                With the <Code>-t</Code> flag, you can select a specific translation table, for instance <Code>-t11</Code> for the bacterial, 
                archaeal and plant plastid code.
            </p>

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
