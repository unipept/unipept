<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap uniq
        </h1>
        <h3 class="font-weight-light">Joins consecutive <Initialism>FASTA</Initialism> records with the same header</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap uniq</Code> command can be used to join together the predictions of 2 paired ends before aggregation.
        </p>

        <HeaderBodyCard id="usage" title="usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i>. The content of all consecutive records with the same 
                <Initialism>FASTA</Initialism> header is joined under a single header, separated by newlines (or another separated set with <Code>-s</Code>).
            </p>

            <p>
                A delimiter can be passed with the <Code>-d</Code> option to drop this delimiter and everything after it from the <Initialism>FASTA</Initialism> 
                header before comparing it.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1/1
                <br>147206
                <br>240495
                <br>>header1/2
                <br>1883
                <br>1
                <br>1883
                <br>1883
                <br><Sentinel>$</Sentinel> <b>umgap uniq -d / &lt; input.fa</b>
                <br>>header1
                <br>147206
                <br>240495
                <br>1883
                <br>1
                <br>1883
                <br>1883
            </Boxed>

            <p>
                Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.
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
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-w / --wrap", description: "Wrap the output sequences" },
    { name: "-s / --separator s", description: "Separator between output items [default: newline]" },
    { name: "-d / --delimiter d", description: "Strip FASTA headers after this string" }
];
</script>
