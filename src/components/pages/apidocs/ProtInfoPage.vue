<template>
    <v-container>
        <h1 class="font-weight-light">
            <Initialism>POST</Initialism> /api/v1/protinfo
        </h1>
        <h3 class="font-weight-light">Returns taxonomic and functional information for a given UniProt identifier</h3>
        
        <v-divider class="my-2" />

        <p>
            This method returns both the taxonomic information and all functional information attached to a UniProt id.
        </p>

        <!-- Request Card -->
        <HeaderBodyCard id="request" title="Request">
            <p>
                The protinfo method can be used by doing a <Initialism>HTTP POST</Initialism>-request (preferred) or <Initialism>GET</Initialism>-request to 
                <Code>https://api.unipept.ugent.be/api/v1/protinfo</Code>. <RLink to="#parameters" router>Parameters</RLink> can be included in the request body 
                (<Initialism>POST</Initialism>) or in the query string (<Initialism>GET</Initialism>). The only required parameter is <Code>input[]</Code>, which 
                takes one or more UniProt id's.
            </p>

            <h3>input</h3>
            <p>
                <Code>input[]</Code> is a required parameter that takes one or more UniProt id's. Unipept will return the functional 
                <Initialism>EC</Initialism>-numbers, <Initialism>GO</Initialism>-terms and InterPro entries associated with each of the <Code>input[]</Code> 
                id's. To pass multiple identifiers at once, simply add multiple <Code>input[]</Code> parameters 
                (see <RLink to="#example2" router>example</RLink>).
            </p>

            <StaticAlert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of UniProt id's passed to the <Code>input[]</Code> parameter. Keep in mind that searching for lots of 
                    input id's at once may cause the request to timeout or, in the case of a <Initialism>GET</Initialism>-request, exceed the maximum 
                    <Initialism>URL</Initialism> length. When performing bulk searches, we suggest splitting the input set over requests of 100 id's each.
                </p>
            </StaticAlert>
        </HeaderBodyCard>

        <!-- Response Card -->
        <HeaderBodyCard id="response" title="Response" class="mt-5">
            <p class="mb-2">
                A list of <Initialism>JSON</Initialism> objects is returned. By default, each object contains the following information fields: 

                <ul class="my-3">
                    <li><Code>protein</Code>: the UniProt id that was searched for.</li>
                    <li><Code>ec</Code>: 
                        A list of <Initialism>JSON</Initialism> objects that each represent an <Initialism>EC</Initialism>-number associated with 
                        the current UniProt id.
                        <ul>
                            <li><Code>ec_number</Code>: <Initialism>EC</Initialism>-number associated with the current protein.</li>
                        </ul>
                    </li>
                    <li><Code>go</Code>: 
                        A list of <Initialism>JSON</Initialism> objects that each represent a <Initialism>GO</Initialism>-term associated with 
                        the current UniProt id.
                        <ul>
                            <li><Code>go_term</Code>: <Initialism>GO</Initialism>-term associated with the current protein.</li>
                        </ul>
                    </li>
                    <li><Code>ipr</Code>: 
                        A list of <Initialism>JSON</Initialism> objects that each represent an InterPro entry associated with 
                        the current UniProt id.
                        <ul>
                            <li><Code>code</Code>: InterPro entry code associated with the current protein.</li>
                        </ul>
                    </li>
                    <li><Code>taxon_id</Code>: the <Initialism>NCBI</Initialism> taxon id attached to the protein</li>
                    <li><Code>taxon_name</Code>: the name of the taxon</li>
                    <li><Code>taxon_rank</Code>: the taxonomic rank of the taxon</li>
                </ul>
            </p>
        </HeaderBodyCard>

        <!-- Parameters Card -->
        <HeaderBodyCard id="parameters" title="Parameters" class="mt-5">
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
                                UniProt id to search for. Add multiple parameters to search for multiple proteins.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: String</div>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>

        <h2 id="examples" class="font-weight-light mt-10 mb-n2">Examples</h2>

        <ExampleCard 
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and organism associated with a given UniProt id" 
            :response="response1"
        >
            <template v-slot:description>
                This example retrieves all functional <Initialism>EC</Initialism>-numbers, <Initialism>GO</Initialism>-terms, InterPro entries and NCBI id associated with the UniProt id <i><Initialism>P00909</Initialism></i>.
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/protinfo -d 'input[]=P00909'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/protinfo.json?input[]=P00909
            </template>
        </ExampleCard>

        <ExampleCard 
            id="example2"
            class="mt-5"
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and organism associated with each of multiple UniProt ids" 
            :response="response2"
        >
            <template v-slot:description>
                This example retrieves all functional <Initialism>EC</Initialism>-numbers, <Initialism>GO</Initialism>-terms, InterPro entries and the NCBI id 
                for both UniProt ids <i><Initialism>P00909</Initialism></i> and <i><Initialism>P07756</Initialism></i>.
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/protinfo -d 'input[]=P00909' -d 'input[]=P07756'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/protinfo.json?input[]=P00909&input[]=P07756
            </template>
        </ExampleCard>

        <TryItCard id="try" class="mt-5" :response="tryItResponse" command="protinfo">
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

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.protinfo(input.value.split('\n'));
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.protinfo(["P00909"]);
    response2.value = await unipeptCommunicator.protinfo(["P00909", "P07756"]);
})
</script>

<style scoped>
.multi-column {
  columns: 3;
  -webkit-columns: 3;
  -moz-columns: 3;
}
</style>
