<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>POST</initialism> /api/v1/taxa2lca
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.
        </h3>

        <v-divider class="my-2" />

        <p>
            This method calculates and returns the taxonomic lowest common ancestor for a given list of <initialism>NCBI</initialism> taxon identifiers.
        </p>

        <!-- Request Card -->
        <header-body-card
            id="request"
            title="Request"
            large-title
        >
            <p>
                The taxa2lca method can be used by doing a <initialism>HTTP POST</initialism>-request (preferred) or <initialism>GET</initialism>-request to <inline-code>https://api.unipept.ugent.be/api/v1/taxa2lca</inline-code>.
                <r-link
                    to="#parameters"
                    router
                >
                    Parameters
                </r-link> can be included in the request body (<initialism>POST</initialism>) or in the query string (<initialism>GET</initialism>).
                The only required parameter is <inline-code>input[]</inline-code>, which takes one or more tryptic peptides.
            </p>

            <h3 class="font-weight-medium">
                input
            </h3>
            <p>
                <inline-code>input[]</inline-code> is a required parameter that takes at least two taxon identifiers.
                Unipept will calculate and return the taxonomic lowest common ancestor of the given taxa.
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

            <h3 class="font-weight-medium">
                extra
            </h3>
            <p>
                <inline-code>extra</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>.
                When not set explicitly, the parameter defaults to <inline-code>false</inline-code>.
                When the parameter is set to <inline-code>true</inline-code>, Unipept will return the complete lineage of the taxonomic lowest common ancestor.
                See the <r-link
                    to="#response"
                    router
                >
                    response
                </r-link> section for an overview of the information fields returned.
            </p>

            <h3 class="font-weight-medium">
                names
            </h3>
            <p>
                <inline-code>names</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>.
                When not set explicitly, the parameter defaults to <inline-code>false</inline-code>.
                When both <inline-code>names</inline-code> and <inline-code>extra</inline-code> are set to <inline-code>true</inline-code>, Unipept will return the names of all ranks in the lineage of the taxonomic lowest common ancestor.
                Setting only <inline-code>names</inline-code> to <inline-code>true</inline-code> will not result in additional information fields being returned.
                See the <r-link
                    to="#response"
                    router
                >
                    response
                </r-link> section for an overview of the information fields returned.
            </p>

            <static-alert title="Performance penalty">
                <p>
                    Setting <inline-code>names</inline-code> to <inline-code>true</inline-code> has a performance penalty inferred from additional database queries.
                    Do not use this parameter unless the extra information fields are needed.
                </p>
            </static-alert>
        </header-body-card>

        <!-- Response Card -->
        <header-body-card
            id="response"
            title="Response"
            class="mt-5"
            large-title
        >
            The taxonomic lowest common ancestor for the given list of taxon identifiers is returned as a <initialism>JSON</initialism> object.
            By default, the object contains the following information fields extracted from the <initialism>NCBI</initialism> taxonomy:

            <ul class="my-3">
                <li><inline-code>taxon_id</inline-code>: the <initialism>NCBI</initialism> taxon id of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_name</inline-code>: the name of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_rank</inline-code>: the taxonomic rank of the taxonomic lowest common ancestor</li>
            </ul>

            When the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>, the object contains additional information about the lineage of the taxonomic lowest common ancestor extracted from the <initialism>NCBI</initialism> taxonomy.
            The taxon id of each rank in the lineage is specified using the following information fields:

            <ul class="multi-column my-3">
                <li><inline-code>superkingdom_id</inline-code></li>
                <li><inline-code>kingdom_id</inline-code></li>
                <li><inline-code>subkingdom_id</inline-code></li>
                <li><inline-code>superphylum_id</inline-code></li>
                <li><inline-code>phylum_id</inline-code></li>
                <li><inline-code>subphylum_id</inline-code></li>
                <li><inline-code>superclass_id</inline-code></li>
                <li><inline-code>class_id</inline-code></li>
                <li><inline-code>subclass_id</inline-code></li>
                <li><inline-code>infraclass_id</inline-code></li>
                <li><inline-code>superorder_id</inline-code></li>
                <li><inline-code>order_id</inline-code></li>
                <li><inline-code>suborder_id</inline-code></li>
                <li><inline-code>infraorder_id</inline-code></li>
                <li><inline-code>parvorder_id</inline-code></li>
                <li><inline-code>superfamily_id</inline-code></li>
                <li><inline-code>family_id</inline-code></li>
                <li><inline-code>subfamily_id</inline-code></li>
                <li><inline-code>tribe_id</inline-code></li>
                <li><inline-code>subtribe_id</inline-code></li>
                <li><inline-code>genus_id</inline-code></li>
                <li><inline-code>subgenus_id</inline-code></li>
                <li><inline-code>species_group_id</inline-code></li>
                <li><inline-code>species_subgroup_id</inline-code></li>
                <li><inline-code>species_id</inline-code></li>
                <li><inline-code>subspecies_id</inline-code></li>
                <li><inline-code>varietas_id</inline-code></li>
                <li><inline-code>forma_id</inline-code></li>
            </ul>

            When both the <inline-code>names</inline-code> and <inline-code>extra</inline-code> parameters are set to <inline-code>true</inline-code>, objects also contain the names for each rank in the lineage using the following information fields:

            <ul class="multi-column mt-3">
                <li><inline-code>superkingdom_name</inline-code></li>
                <li><inline-code>kingdom_name</inline-code></li>
                <li><inline-code>subkingdom_name</inline-code></li>
                <li><inline-code>superphylum_name</inline-code></li>
                <li><inline-code>phylum_name</inline-code></li>
                <li><inline-code>subphylum_name</inline-code></li>
                <li><inline-code>superclass_name</inline-code></li>
                <li><inline-code>class_name</inline-code></li>
                <li><inline-code>subclass_name</inline-code></li>
                <li><inline-code>infraclass_name</inline-code></li>
                <li><inline-code>superorder_name</inline-code></li>
                <li><inline-code>order_name</inline-code></li>
                <li><inline-code>suborder_name</inline-code></li>
                <li><inline-code>infraorder_name</inline-code></li>
                <li><inline-code>parvorder_name</inline-code></li>
                <li><inline-code>superfamily_name</inline-code></li>
                <li><inline-code>family_name</inline-code></li>
                <li><inline-code>subfamily_name</inline-code></li>
                <li><inline-code>tribe_name</inline-code></li>
                <li><inline-code>subtribe_name</inline-code></li>
                <li><inline-code>genus_name</inline-code></li>
                <li><inline-code>subgenus_name</inline-code></li>
                <li><inline-code>species_group_name</inline-code></li>
                <li><inline-code>species_subgroup_name</inline-code></li>
                <li><inline-code>species_name</inline-code></li>
                <li><inline-code>subspecies_name</inline-code></li>
                <li><inline-code>varietas_name</inline-code></li>
                <li><inline-code>forma_name</inline-code></li>
            </ul>
        </header-body-card>

        <!-- Parameters Card -->
        <header-body-card
            id="parameters"
            title="Parameters"
            class="mt-5"
            large-title
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
                            List of taxon identifiers to calculate the lowest common ancestor for. Add multiple parameters to specify multiple taxon id's.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: integer
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b>extra</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Return additional lineage information fields if <inline-code>true</inline-code>.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: Must be <inline-code>true</inline-code> or <inline-code>false</inline-code> (default)
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b>names</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Return names of ranks in the lineage if <inline-code>true</inline-code>.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: Must be <inline-code>true</inline-code> or <inline-code>false</inline-code> (default)
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
            title="Calculate the taxonomic lowest common ancestor for a given list of taxon identifiers"
            :response="response1"
        >
            <template #description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>) and <i>Coprobacter fastidiosus</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">
                    1099853
                </r-link>).
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve the taxonomic lowest common ancestor and its lineage for a given list of taxon identifiers"
            :response="response2"
        >
            <template #description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>) and <i>Coprobacter fastidiosus</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">
                    1099853
                </r-link>), including its complete lineage.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853' -d 'extra=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853&extra=true
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve all UniProt entries containing a single tryptic peptide, while equating I and L"
            :response="response3"
        >
            <template #description>
                This example calculates and retrieves the taxonomic lowest common ancestor of <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>) and <i>Coprobacter fastidiosus</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853">
                    1099853
                </r-link>), including its complete lineage with names.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/taxa2lca -d 'input[]=817' -d 'input[]=329854' -d 'input[]=1099853' -d 'extra=true' -d 'names=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/taxa2lca.json?input[]=817&input[]=329854&input[]=1099853&extra=true&names=true
            </template>
        </example-card>

        <try-it-card
            id="try"
            class="mt-5"
            :response="tryItResponse"
            command="taxa2lca"
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

                <v-col
                    cols="12"
                    class="dark-label"
                >
                    <h3 class="font-weight-medium">
                        Parameters
                    </h3>
                    <v-switch
                        v-model="extra"
                        color="primary"
                        inset
                        label="extra"
                        density="compact"
                        hide-details
                    />
                    <v-switch
                        v-model="names"
                        color="primary"
                        inset
                        label="equate_il"
                        density="compact"
                        hide-details
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
