<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap taxa2agg
        </h1>
        <h3 class="font-weight-light">Aggregates taxon IDs in a <Initialism>FASTA</Initialism> stream</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap taxa2agg</Code> command takes one or more lists of taxon IDs as input and aggregates them into a single consensus taxon.
        </p>

        <HeaderBodyCard id="usage" title="usage">
            <p>
                The input is given in a <Initialism>FASTA</Initialism> format on <i>standard input</i>. Each <Initialism>FASTA</Initialism> record contains a list of taxon IDs, separated 
                by newlines. The output is written to <i>standard output</i>, also in a <Initialism>FASTA</Initialism> format, each record containing a single 
                taxon ID, which is the consensus taxon resulting from aggregation of the given list.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <Initialism>NCBI</Initialism> taxonomy.
            </p>

            <Boxed style="max-height: fit-content;">
                <Sentinel>$</Sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>571525
                <br>571525
                <br>6920
                <br>6920
                <br>1
                <br>6920
                <br><Sentinel>$</Sentinel> <b>umgap taxa2agg taxons.tsv &lt; input.fa</b>
                <br>>header1
                <br>571525
            </Boxed>

            <p>
                By default, the aggregation used is the maximum root-to-leaf path (<Initialism>MRTL</Initialism>). A variant of the 
                lowest common ancestor (<Initialism>LCA</Initialism>*) aggregation is also available via the <Code>-a</Code> and 
                <Code>-m</Code> options, as is a hybrid approach.
            </p>

            <ul>
                <li>
                    <b>-m rmq -a mrtl</b> is the default aggregation strategy. It selects the taxon from the given list which has the 
                    highest frequency of ancestors in the list (including its own frequency). A range-minimum-query (<Initialism>RMQ</Initialism>) 
                    algorithm is used.
                </li>
                <li>
                    <b>-m tree -a lca\*</b> returns the taxon (possibly not from the list) of lowest rank without contradicting taxa in 
                    the list. Non-contradicting taxa of a taxon are either itself, its ancestors and its descendants. A tree-based 
                    algorithm is used.
                </li>
                <li>
                    <b>-m tree -a hybrid</b> mixes the above two strategies, which results in a taxon which might have not have the 
                    highest frequency of ancestors in the list, but would have less contradicting taxa. Use the <Code>-f</Code> option 
                    to select a hybrid close to the <Code>MRTL(-f 0.0)</Code> or to the <Code>LCA (-f 1.0)</Code>.
                </li>
            </ul>

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
    { name: "-r / --ranked", description: "Let all taxa snap to taxa with a named rank (such as species) during calculations" },
    { name: "-s / --scored", description: "Each taxon is followed by a score between 0 and 1" },
    { name: "-f / --factor f", description: "The factor for the hybrid aggregation, from 0.0 (MRTL) to 1.0 (LCA*) [default: 0.25]" },
    { name: "-l / --lower-bound l", description: "The smallest input frequency for a taxon to be included in the aggregation [default: 0]" },
    { name: "-m / --method m", description: "The method to use for aggregation [default: tree] [possible values: tree, rmq]" },
    { name: "-a / --aggregate a", description: "The strategy to use for aggregation [default: hybrid] [possible values: lca*, hybrid, mrtl]" }
];
</script>
