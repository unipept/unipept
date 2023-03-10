<template>
    <v-container>
        <h1 class="font-weight-light">
            <Initialism>POST</Initialism> /api/v1/taxa2tree
        </h1>
        <h3 class="font-weight-light">Returns the taxonomic tree for a given list of taxon identifiers.</h3>
        
        <v-divider class="my-2" />

        <p>
            This method constructs and returns the taxonomic tree for a given list of <Initialism>NCBI</Initialism> taxon identifiers. 
        </p>

        <!-- Request Card -->
        <HeaderBodyCard id="request" title="Request">
            <p>
                The taxa2tree method can be used by doing a <Initialism>HTTP POST</Initialism>-request (preferred) or <Initialism>GET</Initialism>-request to 
                <Code>https://api.unipept.ugent.be/api/v1/taxa2tree</Code>. <RLink to="#parameters" router>Parameters</RLink> can be included in the request body 
                (<Initialism>POST</Initialism>) or in the query string (<Initialism>GET</Initialism>). The only required parameter is <Code>input[]</Code>, which 
                takes one or more tryptic peptides.
            </p>

            <h3>input</h3>
            <p>
                <Code>input[]</Code> is a required parameter that takes at least one taxon identifier. Unipept will compute and return the taxonomic tree for the 
                given taxa. To pass multiple taxon identifiers, simply add multiple <Code>input[]</Code> parameters (see <RLink to="#example" router>example</RLink>).
            </p>

            <StaticAlert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of peptides passed to the <Code>input[]</Code> parameter. Keep in mind that searching for lots of 
                    peptides at once may cause the request to timeout or, in the case of a <Initialism>GET</Initialism>-request, exceed the maximum 
                    <Initialism>URL</Initialism> length. When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each.
                </p>
            </StaticAlert>
            
            <h3>link</h3>
            <p>
                <Code>link</Code> is an optional parameter and can either be <Code>true</Code> or <Code>false</Code>. When not set explicitly, the parameter 
                defaults to <Code>false</Code>. When the parameter is set to <Code>true</Code>, Unipept will return an <Initialism>URL</Initialism> that points 
                to a GitHub gist in which the visualization code for this sample is stored. See the <RLink to="#response" router>response</RLink> section for an 
                overview of the information fields returned.
            </p>
        </HeaderBodyCard>

        <!-- Response Card -->
        <HeaderBodyCard id="response" title="Response" class="mt-5">
            <p class="mb-2">
                The taxonomic tree for the given list of taxon identifiers is returned as a <Initialism>JSON</Initialism> object. This object is a tree that's 
                represented by a hierarchical construction of nodes. By default, the object contains the following information fields extracted from the 
                <Initialism>NCBI</Initialism> taxonomy:

                <ul class="my-3">
                    <li><Code>id</Code>: the <Initialism>NCBI</Initialism> taxon id of the node</li>
                    <li><Code>name</Code>: the name of the node</li>
                    <li><Code>rank</Code>: the taxonomic rank of the node</li>
                    <li><Code>data</Code>: extra information associated with this node.
                        <ul>
                            <li><Code>count</Code>: 
                                how many of the given taxa are directly or indirectly associated with this node? (e.g. correspond to the node itself or one of it's children)
                            </li>
                            <li><Code>self_count</Code>: how many of the given taxa are directly associated with this node?</li>
                        </ul>
                    </li>
                    <li><Code>children</Code>: 
                        a list of nodes that are the children of this node in the <Initialism>NCBI</Initialism>-taxonomy. These have the same structure as the root 
                        <Initialism>JSON</Initialism>-object.
                    </li>
                </ul>
            </p>
        </HeaderBodyCard>

        <!-- GET Parameters Card -->
        <HeaderBodyCard id="parameters" title="GET-Parameters" class="mt-5">
            <!-- TODO: table component? -->
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Name</th>
                            <th class="text-left">Description</th>
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
                                <div class="mt-3" style="font-size: 85%;">Value: Integer</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <b>link</b>
                                <br>
                                <i style="font-size: 85%;">optional</i>
                            </td>
                            <td class="py-3">
                                Return an URL that points to a GitHub gist in which the visualization code for this sample is stored if <Code>true</Code>.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <Code>true</Code> or <Code>false</Code> (default)</div>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>

        <!-- POST Parameters Card -->
        <HeaderBodyCard title="POST-Parameters" class="mt-5">
            <!-- TODO: table component? -->
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Name</th>
                            <th class="text-left">Description</th>
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
                                List of taxon identifiers and associated counts to calculate the taxonomic tree for. Should be a <Initialism>JSON</Initialism>-object 
                                with taxon id's as keys and counts as values.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Object</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <b>link</b>
                                <br>
                                <i style="font-size: 85%;">optional</i>
                            </td>
                            <td class="py-3">
                                Return an URL that points to a GitHub gist in which the visualization code for this sample is stored if <Code>true</Code>.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <Code>true</Code> or <Code>false</Code> (default)</div>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>

        <h2 id="examples" class="font-weight-light mt-10 mb-n2">Examples</h2>

        <ExampleCard 
            id="example"
            title="Calculate the taxonomic tree for a given list of taxon identifiers" 
            :response="response1"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic tree of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>) 
                and <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>).
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2tree -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=817&input[]=329854&input[]=1099853
            </template>
        </ExampleCard>

        <ExampleCard 
            class="mt-5"
            title="Retrieve the taxonomic tree and its lineage for a given list of taxon identifiers" 
            :response="response1"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic tree of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>) 
                and <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>).
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2tree --data '{"counts": {"817": 3, "329854": 5, "1099853": 7}}'
            </template>
            <template v-slot:get>
                Can only be performed with a POST-request
            </template>
        </ExampleCard>

        <ExampleCard 
            class="mt-5"
            title="Retrieve the taxonomic tree and its lineage for a given list of taxon identifiers" 
            :response="response2"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic tree of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>), 
                <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>) and 
                returns a GitHub gist link.
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2tree -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853' -d 'link=true'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=817&input[]=329854&input[]=1099853&link=true
            </template>
        </ExampleCard>

        <TryItCard id="try" class="mt-5" :response="tryItResponse" command="taxa2tree">
            <template>
                <v-row>
                    <v-col class="font-weight-bold" cols=12 md=2>Input[]</v-col>
                    <v-col cols=12 md=10>
                        <v-textarea
                            class="pt-0 mt-0"
                            v-model="input"
                            clearable
                            no-resize
                            filled
                            clear-icon="mdi-close-circle"
                        ></v-textarea>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col class="font-weight-bold" cols=4 sm=2>link</v-col>
                    <v-col cols=8 sm=10>
                        <v-switch
                            class="pt-0 mt-0"
                            v-model="link"
                            inset
                        ></v-switch>
                    </v-col>
                </v-row>

                <v-row class="justify-end mx-0 mb-0 ">
                    <v-btn
                        class="col-12 col-sm-2"
                        color="primary"
                        @click="doRequest"
                    >
                        Try it!
                    </v-btn>
                </v-row>
            </template>
        </TryItCard>
    </v-container>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import UnipeptCommunicator from '@/logic/communicators/unipept/UnipeptCommunicator';

import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Code from '@/components/highlights/InlineCode.vue';
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
