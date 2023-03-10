<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap pept2lca
        </h1>
        <h3 class="font-weight-light">Maps a <Initialism>FASTA</Initialism> stream of peptides to taxon IDs.</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap pept2lca</Code> command takes one or more amino acid sequences and looks up the corresponding taxon ID in an 
            index file (as build by the <Code>umgap buildindex</Code> command).
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given in <Initialism>FASTA</Initialism> format on <i>standard input</i>. Per <Initialism>FASTA</Initialism> header, there can be multiple sequences, each on 
                a line. In the following example we match tryptic peptides on their lowest common ancestor in the <Initialism>NCBI</Initialism> taxonomy.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>AAALTER
                <br>ENFVYLAK
                <br><Sentinel>$</Sentinel> <b>umgap pept2lca tryptic-peptides.index &lt; input.fa</b>
                <br>>header1
                <br>2
                <br>3398
            </Boxed>

            <p>
                By default, sequences not found in the index are ignored. Using the <Code>-o (--on-on-one)</Code> flag, they are mapped 
                to 0, instead.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>NOTATRYPTICPEPTIDE
                <br>ENFVYLAK
                <br><Sentinel>$</Sentinel> <b>umgap pept2lca -o tryptic-peptides.index &lt; input.fa</b>
                <br>>header1
                <br>0
                <br>3398
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
    { name: "-m / --in-memory", description: "Load index in memory instead of memory mapping the file contents. This makes querying significantly faster, but requires some initialization time." },
    { name: "-o / --one-on-one", description: "Map unknown sequences to 0 instead of ignoring them" },
    { name: "-c / --chunksize c", description: "Number of reads grouped into one chunk. Bigger chunks decrease the overhead caused by multithreading. Because the output order is not necessarily the same as the input order, having a chunk size which is a multiple of 12 (all 6 translations multiplied by the two paired-end reads) will keep FASTA records that originate from the same reads together [default: 240]" },
];
</script>
