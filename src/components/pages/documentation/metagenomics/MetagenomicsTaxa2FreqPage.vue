<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap taxa2freq
        </h1>
        <h3 class="font-weight-light">
            Counts ranked taxon occurrences in a stream of taxon IDs or arguments
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap taxa2freq</inline-code> command creates a frequency table of a list of taxa on a given target rank (species
            by default). When invoked with file arguments, it adds a column for each file.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i>, or in multiple file arguments, a single taxon ID on each line. Each taxon
                that is more specific than the target rank is counted towards its ancestor on the target rank. Each taxon less specific
                than the target rank is counted towards root. The command outputs a <initialism>CSV</initialism> table of counts, taxon
                IDs and their names.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <initialism>NCBI</initialism> taxonomy.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.txt</b>
                <br>9606
                <br>9606
                <br>2759
                <br>9606
                <br>9606
                <br>9606
                <br>9606
                <br>9606
                <br>9606
                <br>9606
                <br>8287
                <br><sentinel>$</sentinel> <b>umgap taxa2freq taxons.tsv &lt; input.txt</b>
                <br>taxon id,taxon name,stdin
                <br>1,root,2
                <br>9606,Homo sapiens,9
                <br><sentinel>$</sentinel> <b>umgap taxa2freq taxons.tsv input.txt input.txt</b>
                <br>taxon id,taxon name,input.txt,input.txt
                <br>1,root,2,2
                <br>9606,Homo sapiens,9,9
            </boxed>

            <p>
                With the <inline-code>-r</inline-code> option, the default species rank can be set to any named rank.
            </p>

            <boxed>
                <sentinel>$</sentinel> <b>umgap taxa2freq -r phylum taxons.tsv &lt; input.txt</b>
                <br>taxon id,taxon name,stdin
                <br>7711,Chordata,10
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
    { name: "-f / --frequency f", description: "The minimum frequency to be reported [default: 1]" },
    { name: "-r / --rank r", description: "The rank to show [default: species]" }
];
</script>
