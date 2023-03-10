<template>
    <v-container>
        <h1 class="font-weight-light">
            <Initialism>POST</Initialism> /api/v1/taxa2lca
        </h1>
        <h3 class="font-weight-light">Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.</h3>
        
        <v-divider class="my-2" />

        <p>
            This method calculates and returns the taxonomic lowest common ancestor for a given list of <Initialism>NCBI</Initialism> taxon identifiers. 
        </p>

        <!-- Request Card -->
        <HeaderBodyCard id="request" title="Request">
            <p>
                The taxa2lca method can be used by doing a <Initialism>HTTP POST</Initialism>-request (preferred) or <Initialism>GET</Initialism>-request to 
                <Code>https://api.unipept.ugent.be/api/v1/taxa2lca</Code>. <RLink to="#parameters" router>Parameters</RLink> can be included in the request body 
                (<Initialism>POST</Initialism>) or in the query string (<Initialism>GET</Initialism>). The only required parameter is <Code>input[]</Code>, which 
                takes one or more tryptic peptides.
            </p>

            <h3>input</h3>
            <p>
                <Code>input[]</Code> is a required parameter that takes at least two taxon identifiers. Unipept will calculate and return the taxonomic lowest 
                common ancestor of the given taxa. To pass multiple taxon identifiers, simply add multiple <Code>input[]</Code> parameters 
                (see <RLink to="#example" router>example</RLink>).
            </p>

            <StaticAlert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of peptides passed to the <Code>input[]</Code> parameter. Keep in mind that searching for lots of 
                    peptides at once may cause the request to timeout or, in the case of a <Initialism>GET</Initialism>-request, exceed the maximum 
                    <Initialism>URL</Initialism> length. When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each.
                </p>
            </StaticAlert>
            
            <h3>extra</h3>
            <p>
                <Code>extra</Code> is an optional parameter and can either be <Code>true</Code> or <Code>false</Code>. When not set explicitly, the parameter 
                defaults to <Code>false</Code>. When the parameter is set to <Code>true</Code>, Unipept will return the complete lineage of the taxonomic lowest 
                common ancestor. See the <RLink to="#response" router>response</RLink> section for an overview of the information fields returned.
            </p>

            <h3>names</h3>
            <p>
                <Code>names</Code> is an optional parameter and can either be <Code>true</Code> or <Code>false</Code>. When not set explicitly, the parameter 
                defaults to <Code>false</Code>. When both <Code>names</Code> and <Code>extra</Code> are set to <Code>true</Code>, Unipept will return the names of 
                all ranks in the lineage of the taxonomic lowest common ancestor. Setting only <Code>names</Code> to <Code>true</Code> will not result in additional 
                information fields being returned. See the <RLink to="#response" router>response</RLink> section for an overview of the information fields returned. 
            </p>

            <StaticAlert title="Performance penalty">
                <p>
                    Setting <Code>names</Code> to <Code>true</Code> has a performance penalty inferred from additional database queries. Do not use this parameter 
                    unless the extra information fields are needed.
                </p>
            </StaticAlert>
        </HeaderBodyCard>

        <!-- Response Card -->
        <HeaderBodyCard id="response" title="Response" class="mt-5">
            <p class="mb-2">
                The taxonomic lowest common ancestor for the given list of taxon identifiers is returned as a <Initialism>JSON</Initialism> object. 
                By default, the object contains the following information fields extracted from the <Initialism>NCBI</Initialism> taxonomy: 

                <ul class="my-3">
                    <li><Code>taxon_id</Code>: the <Initialism>NCBI</Initialism> taxon id of the taxonomic lowest common ancestor</li>
                    <li><Code>taxon_name</Code>: the name of the taxonomic lowest common ancestor</li>
                    <li><Code>taxon_rank</Code>: the taxonomic rank of the taxonomic lowest common ancestor</li>
                </ul>

                When the <Code>extra</Code> parameter is set to <Code>true</Code>, the object contains additional information about the lineage of the taxonomic lowest 
                common ancestor extracted from the <Initialism>NCBI</Initialism> taxonomy. The taxon id of each rank in the lineage is specified using the following 
                information fields:

                <ul class="multi-column my-3">
                    <li><Code>superkingdom_id</Code></li>
                    <li><Code>kingdom_id</Code></li>
                    <li><Code>subkingdom_id</Code></li>
                    <li><Code>superphylum_id</Code></li>
                    <li><Code>phylum_id</Code></li>
                    <li><Code>subphylum_id</Code></li>
                    <li><Code>superclass_id</Code></li>
                    <li><Code>class_id</Code></li>
                    <li><Code>subclass_id</Code></li>
                    <li><Code>infraclass_id</Code></li>
                    <li><Code>superorder_id</Code></li>
                    <li><Code>order_id</Code></li>
                    <li><Code>suborder_id</Code></li>
                    <li><Code>infraorder_id</Code></li>
                    <li><Code>parvorder_id</Code></li>
                    <li><Code>superfamily_id</Code></li>
                    <li><Code>family_id</Code></li>
                    <li><Code>subfamily_id</Code></li>
                    <li><Code>tribe_id</Code></li>
                    <li><Code>subtribe_id</Code></li>
                    <li><Code>genus_id</Code></li>
                    <li><Code>subgenus_id</Code></li>
                    <li><Code>species_group_id</Code></li>
                    <li><Code>species_subgroup_id</Code></li>
                    <li><Code>species_id</Code></li>
                    <li><Code>subspecies_id</Code></li>
                    <li><Code>varietas_id</Code></li>
                    <li><Code>forma_id</Code></li>
                </ul>

                When both the <Code>names</Code> and <Code>extra</Code> parameters are set to <Code>true</Code>, objects also contain the names for each rank in 
                the lineage using the following information fields:

                <ul class="multi-column mt-3">
                    <li><Code>superkingdom_name</Code></li>
                    <li><Code>kingdom_name</Code></li>
                    <li><Code>subkingdom_name</Code></li>
                    <li><Code>superphylum_name</Code></li>
                    <li><Code>phylum_name</Code></li>
                    <li><Code>subphylum_name</Code></li>
                    <li><Code>superclass_name</Code></li>
                    <li><Code>class_name</Code></li>
                    <li><Code>subclass_name</Code></li>
                    <li><Code>infraclass_name</Code></li>
                    <li><Code>superorder_name</Code></li>
                    <li><Code>order_name</Code></li>
                    <li><Code>suborder_name</Code></li>
                    <li><Code>infraorder_name</Code></li>
                    <li><Code>parvorder_name</Code></li>
                    <li><Code>superfamily_name</Code></li>
                    <li><Code>family_name</Code></li>
                    <li><Code>subfamily_name</Code></li>
                    <li><Code>tribe_name</Code></li>
                    <li><Code>subtribe_name</Code></li>
                    <li><Code>genus_name</Code></li>
                    <li><Code>subgenus_name</Code></li>
                    <li><Code>species_group_name</Code></li>
                    <li><Code>species_subgroup_name</Code></li>
                    <li><Code>species_name</Code></li>
                    <li><Code>subspecies_name</Code></li>
                    <li><Code>varietas_name</Code></li>
                    <li><Code>forma_name</Code></li>
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
                                List of taxon identifiers to calculate the lowest common ancestor for. Add multiple parameters to specify multiple taxon id's.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Integer</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <b>extra</b>
                                <br>
                                <i style="font-size: 85%;">optional</i>
                            </td>
                            <td class="py-3">
                                Return additional lineage information fields if <Code>true</Code>.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <Code>true</Code> or <Code>false</Code> (default)</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <b>names</b>
                                <br>
                                <i style="font-size: 85%;">optional</i>
                            </td>
                            <td class="py-3">
                                Return names of ranks in the lineage if <Code>true</Code>.
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
            title="Calculate the taxonomic lowest common ancestor for a given list of taxon identifiers" 
            :response="response1"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>) 
                and <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>).
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853
            </template>
        </ExampleCard>

        <ExampleCard 
            class="mt-5"
            title="Retrieve the taxonomic lowest common ancestor and its lineage for a given list of taxon identifiers" 
            :response="response2"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>) 
                and <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>), 
                including its complete lineage.
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853' -d 'extra=true'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853&extra=true
            </template>
        </ExampleCard>

        <ExampleCard 
            class="mt-5"
            title="Retrieve all UniProt entries containing a single tryptic peptide, while equating I and L" 
            :response="response3"
        >
            <template v-slot:description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id 
                <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">817</RLink>), 
                <i>Bacteroides intestinalis</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">329854</RLink>) 
                and <i>Coprobacter fastidiosus</i> (taxon id <RLink to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">1099853</RLink>), 
                including its complete lineage with names.
            </template>
            <template v-slot:post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853' -d 'extra=true' -d 'names=true'
            </template>
            <template v-slot:get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853&extra=true&names=true
            </template>
        </ExampleCard>

        <TryItCard id="try" class="mt-5" :response="tryItResponse" command="taxa2lca">
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
                    <v-col class="font-weight-bold" cols=4 sm=2>extra</v-col>
                    <v-col cols=8 sm=10>
                        <v-switch
                            class="pt-0 mt-0"
                            v-model="extra"
                            inset
                        ></v-switch>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col class="font-weight-bold" cols=4 sm=2>names</v-col>
                    <v-col cols=8 sm=10>
                        <v-switch
                            class="pt-0 mt-0"
                            v-model="names"
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
const response3 = ref({});

const input = ref("");
const extra = ref(false);
const names = ref(false);

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.taxa2lca(input.value.split('\n'), extra.value, names.value);
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.taxa2lca(["817", "329854", "1099853"]);
    response2.value = await unipeptCommunicator.taxa2lca(["817", "329854", "1099853"], true, undefined);
    response3.value = await unipeptCommunicator.taxa2lca(["817", "329854", "1099853"], true, true);
})
</script>

<style scoped>
.multi-column {
  columns: 3;
  -webkit-columns: 3;
  -moz-columns: 3;
}
</style>
