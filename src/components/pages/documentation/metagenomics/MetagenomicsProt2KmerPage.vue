<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap prot2kmer
        </h1>
        <h3 class="font-weight-light">
            Splits a <initialism>FASTA</initialism> stream of peptides into k-mers
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap prot2kmer</inline-code> command takes one or more peptides as input and outputs all their k-length subsequences
            in order of appearance.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i> with a single peptide per
                <initialism>FASTA</initialism> header, which may be hardwrapped with newlines. All overlapping k-mers of a peptide are
                written to standard output, separated by newlines. The k-mer length is configurable with the <inline-code>-k</inline-code> option,
                and is 9 by default.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>DAIGDVAKAYKKAG*S
                <br><sentinel>$</sentinel> <b>umgap prot2kmer &lt; input.fa</b>
                <br>>header1
                <br>DAIGDVAKA
                <br>AIGDVAKAY
                <br>IGDVAKAYK
                <br>GDVAKAYKK
                <br>DVAKAYKKA
                <br>VAKAYKKAG
                <br>AKAYKKAG*
                <br>KAYKKAG*S
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
    { name: "-k / --length k", description: "The k-mer length [default: 9]" }
];
</script>
