<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>POST</initialism> /api/v2/taxa2tree
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic tree for a given list of taxon identifiers.
        </h3>

        <v-divider class="my-2" />

        <p>
            This method constructs and returns the taxonomic tree for a given list of <initialism>NCBI</initialism> taxon identifiers.
        </p>

        <!-- Request Card -->
        <header-body-card
            id="request"
            title="Request"
        >
            <p>
                The taxa2tree method can be used by doing a <initialism>HTTP POST</initialism>-request (preferred) or <initialism>GET</initialism>-request to <inline-code>https://api.unipept.ugent.be/api/v2/taxa2tree</inline-code>.
                <r-link
                    to="#parameters"
                    router
                >
                    Parameters
                </r-link> can be included in the request body (<initialism>POST</initialism>) or in the query string (<initialism>GET</initialism>).
                The only required parameter is <inline-code>input[]</inline-code>, which takes one or more peptides.
            </p>

            <h3 class="font-weight-medium">
                input
            </h3>
            <p>
                <inline-code>input[]</inline-code> is a required parameter that takes at least one taxon identifier.
                Unipept will compute and return the taxonomic tree for the given taxa.
                To pass multiple taxon identifiers, simply add multiple <inline-code>input[]</inline-code> parameters (see <r-link
                    to="#example"
                    router
                >
                    example
                </r-link>).
            </p>

            <static-alert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of peptides passed to the <inline-code>input[]</inline-code> parameter.
                    Keep in mind that searching for lots of peptides at once may cause the request to timeout or, in the case of a <initialism>GET</initialism>-request, exceed the maximum <initialism>URL</initialism> length.
                    When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each.
                </p>
            </static-alert>
        </header-body-card>

        <!-- Response Card -->
        <header-body-card
            id="response"
            title="Response"
            class="mt-5"
        >
            The taxonomic tree for the given list of taxon identifiers is returned as a <initialism>JSON</initialism> object.
            This object is a tree that's represented by a hierarchical construction of nodes.
            By default, the object contains the following information fields extracted from the <initialism>NCBI</initialism> taxonomy:

            <ul class="my-3">
                <li><inline-code>id</inline-code>: the <initialism>NCBI</initialism> taxon id of the node</li>
                <li><inline-code>name</inline-code>: the name of the node</li>
                <li><inline-code>rank</inline-code>: the taxonomic rank of the node</li>
                <li>
                    <inline-code>data</inline-code>: extra information associated with this node.
                    <ul>
                        <li>
                            <inline-code>count</inline-code>:
                            how many of the given taxa are directly or indirectly associated with this node? (e.g. correspond to the node itself or one of it's children)
                        </li>
                        <li><inline-code>self_count</inline-code>: how many of the given taxa are directly associated with this node?</li>
                    </ul>
                </li>
                <li>
                    <inline-code>children</inline-code>:
                    a list of nodes that are the children of this node in the <initialism>NCBI</initialism>-taxonomy. These have the same structure as the root
                    <initialism>JSON</initialism>-object.
                </li>
            </ul>
        </header-body-card>

        <!-- GET Parameters Card -->
        <header-body-card
            id="parameters"
            title="GET-Parameters"
            class="mt-5"
        >
            <v-table>
                <thead>
                    <tr>
                        <th class="text-start">
                            Name
                        </th>
                        <th class="text-start">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <b>Input[]</b>
                            <br>
                            <i style="font-size: 85%;">required</i>
                        </td>
                        <td class="py-3">
                            List of taxon identifiers to calculate the taxonomic tree for. Add multiple parameters to specify multiple taxon id's.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: integer
                            </div>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </header-body-card>

        <!-- POST Parameters Card -->
        <header-body-card
            title="POST-Parameters"
            class="mt-5"
        >
            <v-table>
                <thead>
                    <tr>
                        <th class="text-left">
                            Name
                        </th>
                        <th class="text-left">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <b>Input[]</b>
                            <br>
                            <i style="font-size: 85%;">required</i>
                        </td>
                        <td class="py-3">
                            List of taxon identifiers and associated counts to calculate the taxonomic tree for. Should be a <initialism>JSON</initialism>-object
                            with taxon id's as keys and counts as values.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: Object
                            </div>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </header-body-card>

        <h2
            id="examples"
            class="font-weight-light mt-10"
        >
            Examples
        </h2>

        <example-card
            id="example"
            title="Calculate the taxonomic tree for a given list of taxon identifiers"
            :response="response1"
        >
            <template #description>
                This example calculates and retrieves the taxonomic tree of <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>) and <i>Coprobacter fastidiosus</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">
                    1099853
                </r-link>).
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxa2tree -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/taxa2tree.json?input[]=817&input[]=329854&input[]=1099853
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve the taxonomic tree and its lineage for a given list of taxon identifiers"
            :response="response1"
        >
            <template #description>
                This example calculates and retrieves the taxonomic tree of <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>) and <i>Coprobacter fastidiosus</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">
                    1099853
                </r-link>).
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxa2tree --data '{"counts": {"817": 3, "329854": 5, "1099853": 7}}'
            </template>
            <template #get>
                Can only be performed with a POST-request
            </template>
        </example-card>

        <try-it-card
            id="try"
            class="mt-5"
            :response="tryItResponse"
            command="taxa2tree"
        >
            <v-row>
                <v-col cols="12">
                    <h3 class="font-weight-medium">
                        Input[]
                    </h3>
                    <v-textarea
                        v-model="input"
                        class="pt-0 mt-0"
                        clearable
                        no-resize
                        filled
                        clear-icon="mdi-close-circle"
                    />
                </v-col>

                <v-col cols="12">
                    <v-btn
                        class="col-12 col-sm-2 float-end"
                        color="primary"
                        @click="doRequest"
                    >
                        Try it!
                    </v-btn>
                </v-col>
            </v-row>
        </try-it-card>
    </v-container>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import UnipeptCommunicator from '@/logic/communicators/unipept/UnipeptCommunicator';

import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import InlineCode from '@/components/highlights/InlineCode.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import ExampleCard from '@/components/cards/ExampleCard.vue';
import TryItCard from '@/components/cards/TryItCard.vue';
import RLink from '@/components/highlights/ResourceLink.vue';

const unipeptCommunicator = new UnipeptCommunicator();

const response1 = ref({});
const response2 = ref({});

const input = ref("");
const link = ref(false);

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.taxa2tree(input.value.split('\n'), link.value);
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.taxa2tree(["817", "329854", "1099853"]);
    response2.value = {"gist":"https://gist.github.com/1d3e41bf41c4ca5b97aa802c58484393"}
})
</script>

<style scoped>
.multi-column {
  columns: 3;
  -webkit-columns: 3;
  -moz-columns: 3;
}
</style>
