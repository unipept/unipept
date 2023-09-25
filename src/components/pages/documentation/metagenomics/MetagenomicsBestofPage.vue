<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap bestof
        </h1>
        <h3 class="font-weight-light">
            Selects the best read of every fixed size group
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap bestof</inline-code> command takes groups of taxon IDs as input and outputs for each group the taxon ID with the
            most non-root identifications.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given in <initialism>FASTA</initialism> format on <i>standard input</i>. Per <initialism>FASTA</initialism> header, there should be multiple numbers (taxon IDs).
                Per 6 <initialism>FASTA</initialism> records (or whichever number you specify with <inline-code>-f</inline-code>), the best record is selected and written to
                <i>standard output</i>. If the input is a series of identified taxon IDs for each of the 6 translations of a read,
                the output will most likely come from the actual coding frame.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat dna.fa</b>
                <br>>header1
                <br>CGCAGAGACGGGTAGAACCTCAGTAATCCGAAAAGCCGGGATCGACCGCCCCTTGCTTGCAGCCGGGCACTACAGGACCC
                <br><sentinel>$</sentinel> <b>umgap translate -n -a &lt; dna.fa | umgap prot2kmer2lca 9mer.index | tee input.fa</b>
                <br>>header1|1
                <br>9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
                <br>>header1|2
                <br>2026807 888268 186802 1598 1883
                <br>>header1|3
                <br>1883
                <br>>header1|1R
                <br>27342 2759 155619 1133106 38033 2
                <br>>header1|2R
                <br>>header1|3R
                <br>2951
                <br><sentinel>$</sentinel> <b>umgap bestof &lt; input.fa</b>
                <br>>header1|1
                <br>9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
            </boxed>

            <p>
                Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.
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
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-f / --frames f", description: "The number of frames of which to pick the best [default: 6]" }
];
</script>
