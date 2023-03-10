<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap prot2tryp
        </h1>
        <h3 class="font-weight-light">Splits a <Initialism>FASTA</Initialism> stream into tryptic peptides</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap prot2tryp</Code> command takes one or more amino acid sequences as input and applies an <i>in silico</i> peptide digest.
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i> with a single peptide per 
                <Initialism>FASTA</Initialism> header, which may be hardwrapped with newlines. The peptides resulting from the digest are 
                written in <Initialism>FASTA</Initialism> format to <i>standard output</i>, with multiple peptides per <Initialism>FASTA</Initialism> 
                header, separated by newlines.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
                <br><Sentinel>$</Sentinel> <b>umgap prot2tryp tryptic-lca.index &lt; input.fa</b>
                <br>>header1
                <br>AYK
                <br>K
                <br>AGVSGHVWQSDGITNCLLR
                <br>GLTR
                <br>VK
                <br>EAVANR
                <br>DSGNGYINK
                <br>VYYWTVDK
                <br>R
                <br>ATTR
                <br>DALDAGVDGIMTNYPDVITDVLN
            </Boxed>

            <p>
                Using the <Code>-p</Code> flag, you can change the splitting pattern. The default pattern (<Code>[KR])([^P]</Code>) 
                splits between any Lysine (K) or Arginine (R), followed by any amino acid that is not Proline (P).
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
    { name: "-p / --pattern p", description: "The cleavage-pattern (regex), i.e. the pattern after which the next peptide will be cleaved for tryptic peptides) [default: ([KR])([^P])]" }
];
</script>
