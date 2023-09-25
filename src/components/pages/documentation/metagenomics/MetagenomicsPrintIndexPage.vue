<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap printindex
        </h1>
        <h3 class="font-weight-light">
            Prints the key/value pairs in an index
        </h3>

        <v-divider class="my-2" />

        <p>
            Outputs in the string keys and taxon ID values in <initialism>TSV</initialism> format, mostly for debugging purposes.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <boxed style="max-height: fit-content;">
<pre>
<sentinel>$</sentinel> <b>umgap printindex tryptic.index</b>
...
AAAAADRPANEIGGR	293089
AAAAADRPAPAGHDHQAVAR	156981
AAAAADRPASQIVR	536018
AAAAADRPE	1707
AAAAADRPEVHALALR	1883427
AAAAADRPFVAEPAR	41275
AAAAADRPIAAHAEDESLVR	33010
AAAAADRPIR	1988
AAAAADRPLAEHGGPVPR	1827
...
</pre>
            </boxed>

            <parameter-table
                class="mt-5 mb-3"
                :parameters="usageParameters"
            />
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import ParameterTable from '@/components/tables/ParameterTable.vue';

const usageParameters = [
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" }
];
</script>
