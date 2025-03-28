<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>POST</initialism> /api/v2/taxonomy
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic information for a given taxon identifier.
        </h3>

        <v-divider class="my-2" />

        <p>
            This method returns the taxonomic information from the Unipept Taxonomy, for a given <initialism>NCBI</initialism> taxon identifier.
        </p>

        <!-- Request Card -->
        <header-body-card
            id="request"
            title="Request"
            large-title
        >
            <p>
                The taxonomy method can be used by doing a <initialism>HTTP POST</initialism>-request (preferred) or <initialism>GET</initialism>-request to <inline-code>https://api.unipept.ugent.be/api/v2/taxonomy</inline-code>.
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
                <inline-code>input[]</inline-code> is a required parameter that takes one or more taxon identifiers. Unipept will return the taxonomic information for the given taxa.
                To pass multiple taxon identifiers, simply add multiple <inline-code>input[]</inline-code> parameters (see <r-link
                    to="#example2"
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
                When the parameter is set to <inline-code>true</inline-code>, Unipept will return the complete lineage for each taxon.
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
                When both <inline-code>names</inline-code> and <inline-code>extra</inline-code> are set to <inline-code>true</inline-code>, Unipept will return the names of all ranks in the lineage of each organism.
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

            <h3 class="font-weight-medium">
                descendants
            </h3>
            <p>
                <inline-code>descendants</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>.
                When not set explicitly, the parameter defaults to <inline-code>false</inline-code>.
                When the parameter is set to <inline-code>true</inline-code>, Unipept will also return all the descendants for each taxon.
            </p>

            <h3 class="font-weight-medium">
                descendants_ranks
            </h3>
            <p>
                <inline-code>descendants_ranks</inline-code> is an optional parameter and should be a list of NCBI ranks. Possible values are listed below.
                When not set explicitly, the parameter defaults to <inline-code>[ "species" ]</inline-code>. When the parameter is set to a non-empty list
                of ranks, Unipept will only return the descendants of the given ranks for each taxon.
            </p>
            <ul class="multi-column my-3">
                <li><inline-code>domain</inline-code></li>
                <li><inline-code>realm</inline-code></li>
                <li><inline-code>kingdom</inline-code></li>
                <li><inline-code>subkingdom</inline-code></li>
                <li><inline-code>superphylum</inline-code></li>
                <li><inline-code>phylum</inline-code></li>
                <li><inline-code>subphylum</inline-code></li>
                <li><inline-code>superclass</inline-code></li>
                <li><inline-code>class</inline-code></li>
                <li><inline-code>subclass</inline-code></li>
                <li><inline-code>infraclass</inline-code></li>
                <li><inline-code>superorder</inline-code></li>
                <li><inline-code>order</inline-code></li>
                <li><inline-code>suborder</inline-code></li>
                <li><inline-code>infraorder</inline-code></li>
                <li><inline-code>parvorder</inline-code></li>
                <li><inline-code>superfamily</inline-code></li>
                <li><inline-code>family</inline-code></li>
                <li><inline-code>subfamily</inline-code></li>
                <li><inline-code>tribe</inline-code></li>
                <li><inline-code>subtribe</inline-code></li>
                <li><inline-code>genus</inline-code></li>
                <li><inline-code>subgenus</inline-code></li>
                <li><inline-code>species_group</inline-code></li>
                <li><inline-code>species_subgroup</inline-code></li>
                <li><inline-code>species</inline-code></li>
                <li><inline-code>subspecies</inline-code></li>
                <li><inline-code>varietas</inline-code></li>
                <li><inline-code>forma</inline-code></li>
            </ul>
        </header-body-card>

        <!-- Response Card -->
        <header-body-card
            id="response"
            title="Response"
            class="mt-5"
        >
            The organisms associated with the given taxon identifiers are returned as a list of <initialism>JSON</initialism> objects.
            By default, each object contains the following information fields extracted from the UniProt entry and <initialism>NCBI</initialism> taxonomy:

            <ul class="my-3">
                <li><inline-code>taxon_id</inline-code>: the <initialism>NCBI</initialism> taxon id of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_name</inline-code>: the name of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_rank</inline-code>: the taxonomic rank of the taxonomic lowest common ancestor</li>
            </ul>

            When the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>, the object contains additional information about the lineage of the organisms
            extracted from the <initialism>NCBI</initialism> taxonomy. The taxon id of each rank in the lineage is specified using the following
            information fields:

            <ul class="multi-column my-3">
                <li><inline-code>domain_id</inline-code></li>
                <li><inline-code>realm_id</inline-code></li>
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

            When both the <inline-code>names</inline-code> and <inline-code>extra</inline-code> parameters are set to <inline-code>true</inline-code>, objects also contain the names for each rank in
            the lineage using the following information fields:

            <ul class="multi-column mt-3">
                <li><inline-code>domain_name</inline-code></li>
                <li><inline-code>realm_name</inline-code></li>
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
                            Taxon identifier to search for. Add multiple parameters to search for multiple taxon identifiers.
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: string
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
                    <tr>
                        <td>
                            <b>descendants</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Return all descendants for each input taxon.
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
                            <b>descendants_ranks</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Return only descendants of the given ranks for each input taxon. <inline-code>[ "species" ]</inline-code> (default)
                            <br>
                            <div
                                class="mt-3"
                                style="font-size: 85%;"
                            >
                                Value: Must be a valid list of NCBI ranks, see <r-link
                                    to="#request"
                                    router
                                >request</r-link>
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
            title="Retrieve taxonomic information for a given taxon identifier"
            :response="response1"
        >
            <template #description>
                This example retrieves taxonomic information for the organism <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>).
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxonomy -d 'input[]=817'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/taxonomy.json?input[]=817
            </template>
        </example-card>

        <example-card
            id="example2"
            class="mt-5"
            title="Retrieve taxonomic information for a given list of taxon identifiers"
            :response="response2"
        >
            <template #description>
                This example retrieves taxonomic information for the organism <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>) and <i>Bacteroides intestinalis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854">
                    329854
                </r-link>).
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxa2lca -d 'input[]=817' -d 'input[]=329854'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/taxa2lca.json?input[]=817&input[]=329854
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve taxonomic information for a given taxon identifier including its complete lineage"
            :response="response3"
        >
            <template #description>
                This example retrieves taxonomic information for the organism <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), including its complete lineage.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxonomy -d 'input[]=817' -d 'extra=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/taxonomy.json?input[]=817&extra=true
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve taxonomic information for a given taxon identifier including its complete lineage and names"
            :response="response4"
        >
            <template #description>
                This example retrieves taxonomic information for the organism <i>Bacteroides fragilis</i> (taxon id <r-link to="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817">
                    817
                </r-link>), including its complete lineage with names.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxonomy -d 'input[]=817' -d 'extra=true' -d 'names=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/taxonomy.json?input[]=817&extra=true&names=true
            </template>
        </example-card>

        <try-it-card
            id="try"
            class="mt-5"
            :response="tryItResponse"
            command="taxonomy"
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
                        label="names"
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
const response4 = ref({});

const input = ref("");
const extra = ref(false);
const names = ref(false);

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.taxonomy(input.value.split('\n'), extra.value, names.value);
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.taxonomy(["817"]);
    response2.value = await unipeptCommunicator.taxonomy(["817", "329854"]);
    response3.value = await unipeptCommunicator.taxonomy(["817"], true, undefined);
    response4.value = await unipeptCommunicator.taxonomy(["817"], true, true);
})
</script>

<style scoped>
.multi-column {
  columns: 3;
  -webkit-columns: 3;
  -moz-columns: 3;
}
</style>
