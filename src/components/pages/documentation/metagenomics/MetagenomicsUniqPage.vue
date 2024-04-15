<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap uniq
        </h1>
        <h3 class="font-weight-light">
            Joins consecutive <initialism>FASTA</initialism> records with the same header
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap uniq</inline-code> command can be used to join together the predictions of 2 paired ends before aggregation.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i>. The content of all consecutive records with the same
                <initialism>FASTA</initialism> header is joined under a single header, separated by newlines (or another separated set with <inline-code>-s</inline-code>).
            </p>

            <p>
                A delimiter can be passed with the <inline-code>-d</inline-code> option to drop this delimiter and everything after it from the <initialism>FASTA</initialism>
                header before comparing it.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1/1
                <br>147206
                <br>240495
                <br>>header1/2
                <br>1883
                <br>1
                <br>1883
                <br>1883
                <br><sentinel>$</sentinel> <b>umgap uniq -d / &lt; input.fa</b>
                <br>>header1
                <br>147206
                <br>240495
                <br>1883
                <br>1
                <br>1883
                <br>1883
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
    { name: "-w / --wrap", description: "Wrap the output sequences" },
    { name: "-s / --separator s", description: "Separator between output items [default: newline]" },
    { name: "-d / --delimiter d", description: "Strip FASTA headers after this string" }
];
</script>
