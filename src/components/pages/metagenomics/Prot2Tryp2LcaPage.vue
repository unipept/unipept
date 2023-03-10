<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap prot2tryp2lca
        </h1>
        <h3 class="font-weight-light">Digests a <Initialism>FASTA</Initialism> stream of peptides and maps all tryptic peptides to taxon IDs.</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap prot2tryp2lca</Code> command takes one or more peptides and splits these into tryptic peptides, possibly 
            filters them, and outputs their lowest common ancestors. It is a combination of the <Code>umgap prot2tryp</Code>, 
            <Code>umgap filter</Code> and <Code>umgap pept2lca</Code> commands to allow more efficient parallel computing (c.f. their 
            documentation for details).
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i> with a single peptide per <Initialism>FASTA</Initialism> header, which may be 
                hardwrapped with newlines. The command prints the lowest common ancestors for each tryptic peptide found in each given 
                peptide to <i>standard output</i>.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
                <br><Sentinel>$</Sentinel> <b>umgap prot2tryp2lca tryptic-lca.index &lt; input.fa</b>
                <br>>header1
                <br>571525
                <br>1
                <br>571525
                <br>6920
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
    { name: "-k / --keep k", description: "Amino acid symbols that a sequence must contain [none by default]" },
    { name: "-d / --drop d", description: "Amino acid symbols that a sequence may not contain [none by default]" },
    { name: "-L / --maxlen L", description: "Maximum length allowed [default: 50]" },
    { name: "-l / --minlen l", description: "Minimum length required [default: 5]" },
    { name: "-p / --pattern p", description: "The cleavage-pattern (regex), i.e. the pattern after which the next peptide will be cleaved for tryptic peptides) [default: ([KR])([^P])]" }
];
</script>
