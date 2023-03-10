<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap seedextend
        </h1>
        <h3 class="font-weight-light">Selects promising regions in sequences of taxon IDs</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap seedextend</Code> command takes one or more sequences of taxon IDs and selects regions of consecutive 
            predictions. It can be used to filter out accidental matches of incorrect taxa.
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i>. It should consist of taxon IDs separated by newlines, and 
                the order of these taxa should reflect their location on a peptide, such as output by the 
                <Code>umgap prot2kmer2lca -o</Code> command. As such, 3 consecutive equal IDs representing 9-mers, for instance, 
                indicate a 11-mer match. This so-called seed could still be extended with other taxa, forming an extended seed. The 
                command writes all taxa in any of these extended seeds to <Code>standard output</Code>.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat dna.fa</b>
                <br>>header1
                <br>CGCAGAGACGGGTAGAACCTCAGTAATCCGAAAAGCCGGGATCGACCGCCCCTTGCTTGCAGCCGGGCACTACAGGACCC
                <br><Sentinel>$</Sentinel> <b>umgap translate -n -a &lt; dna.fa | umgap prot2kmer2lca 9mer.index > input.fa</b>
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
                <br><Sentinel>$</Sentinel> <b>umgap seedextend &lt; input.fa</b>
                <br>>header1|1
                <br>9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
                <br>>header1|2
                <br>>header1|3
                <br>>header1|1R
                <br>>header1|2R
                <br>>header1|3R
            </Boxed>

            <p>             
                Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.
            </p>

            <p>
                The number of consecutive equal IDs to start a seed is 2 by default, and can be changed using the <Code>-s</Code> option. 
                The maximum length of gaps between seeds to join in an extension can be set with <Code>-g</Code>, no gaps are allowed by 
                default.
            </p>

            <p>
                The command can be altered to print only the extended seed with the highest score among all extended seeds. Pass a 
                taxonomy using the <Code>-r taxon.tsv</Code> option to activate this. In this scored mode, extended seeds with gaps are 
                given a penalty of 5, which can be made more or less severe (higher or lower) with the <Code>-p</Code> option.
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
    { name: "-g / --max-gap-size g", description: "The maximum length of a gap between seeds in an extension [default: 0]" },
    { name: "-s / --min-seed-size s", description: "The minimum length of equal taxa to count as seed [default: 2]" },
    { name: "-p / --penalty p", description: "The score penalty for gaps in extended seeds [default: 5]" },
    { name: "-r / --ranked r", description: "Use taxon ranks in given NCBI taxonomy tsv-file to pick extended seed with highest score" }
];
</script>
