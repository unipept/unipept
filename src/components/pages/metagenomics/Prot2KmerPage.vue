<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap prot2kmer
        </h1>
        <h3 class="font-weight-light">Splits a <Initialism>FASTA</Initialism> stream of peptides into k-mers</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap prot2kmer</Code> command takes one or more peptides as input and outputs all their k-length subsequences 
            in order of appearance.
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i> with a single peptide per 
                <Initialism>FASTA</Initialism> header, which may be hardwrapped with newlines. All overlapping k-mers of a peptide are 
                written to standard output, separated by newlines. The k-mer length is configurable with the <Code>-k</Code> option, 
                and is 9 by default.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>DAIGDVAKAYKKAG*S
                <br><Sentinel>$</Sentinel> <b>umgap prot2kmer &lt; input.fa</b>
                <br>>header1
                <br>DAIGDVAKA
                <br>AIGDVAKAY
                <br>IGDVAKAYK
                <br>GDVAKAYKK
                <br>DVAKAYKKA
                <br>VAKAYKKAG
                <br>AKAYKKAG*
                <br>KAYKKAG*S
            </Boxed>

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
    { name: "-k / --length k", description: "The k-mer length [default: 9]" }
];
</script>
