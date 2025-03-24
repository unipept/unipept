<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>POST</initialism> /api/v2/protinfo
        </h1>
        <h3 class="font-weight-light">
            Returns functional information and the lowest common ancestor for a given UniProtKB protein.
        </h3>

        <v-divider class="my-2" />

        <!-- Request Card -->
        <header-body-card
            id="request"
            title="Request"
            large-title
        >
            <p>
                The protinfo method can be used by doing a <initialism>HTTP POST</initialism>-request (preferred) or <initialism>GET</initialism>-request to <inline-code>https://api.unipept.ugent.be/api/v2/protinfo</inline-code>.
                <r-link
                    to="#parameters"
                    router
                >
                    Parameters
                </r-link> can be included in the request body (<initialism>POST</initialism>) or in the query string (<initialism>GET</initialism>).
                The only required parameter is <inline-code>input[]</inline-code>, which takes one or more proteins.
            </p>

            <h3 class="font-weight-medium">
                input
            </h3>
            <p>
                <inline-code>input[]</inline-code> is a required parameter that takes one or more UniProtKB protein identifiers.
                Unipept will return the functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms and InterPro entries associated with each of the <inline-code>input[]</inline-code> proteins.
                To pass multiple proteins at once, simply add multiple <inline-code>input[]</inline-code> parameters (see <r-link
                    to="#example2"
                    router
                >
                    example
                </r-link>).
            </p>

            <static-alert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of proteins passed to the <inline-code>input[]</inline-code> parameter.
                    Keep in mind that searching for lots of proteins at once may cause the request to timeout or, in the case of a <initialism>GET</initialism>-request, exceed the maximum <initialism>URL</initialism> length.
                    When performing bulk searches, we suggest splitting the input set over requests of 100 proteins each.
                </p>
            </static-alert>

            <h3 class="font-weight-medium">
                extra
            </h3>
            <p>
                <inline-code>extra</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>.
                When not set explicitly, the parameter defaults to <inline-code>false</inline-code>.
                When the parameter is set to <inline-code>true</inline-code>, Unipept will also return the name associated with a <initialism>GO</initialism>-term and an <initialism>EC</initialism>-number, the name and type associated with an InterPro entry, and the complete lineage of the taxonomic lowest common ancestor.
                See the <r-link
                    to="#response"
                    router
                >
                    response
                </r-link> section for an overview of the information fields returned.
            </p>

            <h3 class="font-weight-medium">
                domains
            </h3>
            <p>
                <inline-code>domains</inline-code> is an optional parameter that can be used to order the <initialism>GO</initialism>-terms in groups according to their namespace (cellular component, molecular function, biological process).
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
                    Setting <inline-code>extra</inline-code>, <inline-code>domains</inline-code> or <inline-code>names</inline-code> to <inline-code>true</inline-code> has a performance penalty inferred from additional database queries.
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
            A list of <initialism>JSON</initialism> objects is returned. By default, each object contains the following information fields:

            <ul class="my-3">
                <li><inline-code>protein</inline-code>: the protein that was searched for.</li>
                <li><inline-code>name</inline-code>: the name of the protein.</li>
                <li>
                    <inline-code>ec</inline-code>:
                    A list of <initialism>JSON</initialism> objects that each represent an <initialism>EC</initialism>-number associated with
                    the current protein.
                    <ul>
                        <li><inline-code>ec_number</inline-code>: <initialism>EC</initialism>-number associated with the current protein.</li>
                        <li>
                            <inline-code>name</inline-code>:
                            optional, name of the <initialism>EC</initialism>-number. Included when the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>.
                        </li>
                    </ul>
                </li>
                <li>
                    <inline-code>go</inline-code>:
                    A list of <initialism>JSON</initialism> objects that each represent a <initialism>GO</initialism>-term associated with
                    the current protein.
                    <ul>
                        <li><inline-code>go_term</inline-code>: <initialism>GO</initialism>-term associated with the current protein.</li>
                        <li>
                            <inline-code>name</inline-code>:
                            optional, name of the <initialism>GO</initialism>-term. Included when the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>.
                        </li>
                    </ul>
                </li>
                <li>
                    <inline-code>ipr</inline-code>:
                    A list of <initialism>JSON</initialism> objects that each represent an InterPro entry associated with
                    the current protein.
                    <ul>
                        <li><inline-code>code</inline-code>: InterPro entry code associated with the current protein.</li>
                        <li>
                            <inline-code>name</inline-code>:
                            optional, name of the InterPro entry. Included when the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>.
                        </li>
                        <li>
                            <inline-code>type</inline-code>:
                            optional, type of the InterPro entry. Included when the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>.
                        </li>
                    </ul>
                </li>
                <li><inline-code>taxon_id</inline-code>: the <initialism>NCBI</initialism> taxon id of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_name</inline-code>: the name of the taxonomic lowest common ancestor</li>
                <li><inline-code>taxon_rank</inline-code>: the taxonomic rank of the taxonomic lowest common ancestor</li>
            </ul>

            <p>
                When the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>, objects contain additional information about the lineage of the taxonomic lowest common ancestor extracted from the <initialism>NCBI</initialism> taxonomy.
                The taxon id of each rank in the lineage is specified using the following information fields:
            </p>

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

            <p>
                The <inline-code>name</inline-code> associated with a <initialism>GO</initialism>-term and an <initialism>EC</initialism>-number, and the name and type of an InterPro
                entry, are also provided when the extra parameter is set to true.
            </p>

            <p>
                When both the <inline-code>names</inline-code> and <inline-code>extra</inline-code> parameters are set to <inline-code>true</inline-code>, objects also contain the names for each rank in
                the lineage using the following information fields:
            </p>

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

            <p class="mt-3">
                When the <inline-code>domains</inline-code> parameter is set to <inline-code>true</inline-code>, objects are placed in a group corresponding to their namespace and the objects
                are nested in an additional object. See the examples for more information on how to use this.
            </p>
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
                            Protein to search for. Add multiple parameters to search for multiple proteins.
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
                            <b>equate_il</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Equate isoleucine (I) and leucine (L).
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
                            <b>extra</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Return additional information fields if <inline-code>true</inline-code>.
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
                            <b>domains</b>
                            <br>
                            <i style="font-size: 85%;">optional</i>
                        </td>
                        <td class="py-3">
                            Separates <initialism>GO</initialism>-namespaces and InterPro types and places objects in group associated with current namespace or
                            type when <inline-code>true</inline-code>.
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
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and lowest common ancestor associated with a given protein"
            :response="response1"
        >
            <template #description>
                This example retrieves all functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms, InterPro entries and the lowest common ancestor associated with the protein <i><initialism>A0JP26</initialism></i>.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/protinfo -d 'input[]=A0JP26'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/protinfo.json?input[]=A0JP26
            </template>
        </example-card>

        <example-card
            id="example2"
            class="mt-5"
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and lowest common ancestor associated with each of multiple proteins"
            :response="response2"
        >
            <template #description>
                This example retrieves all functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms, InterPro entries and the lowest common ancestor for both the proteins <i><initialism>A0JP26</initialism></i> and <i><initialism>A0PK11</initialism></i>.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/protinfo -d 'input[]=A0JP26' -d 'input[]=A0PK11'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/protinfo.json?input[]=A0JP26&input[]=A0PK11
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and lowest common ancestor associated with a single protein"
            :response="response4"
        >
            <template #description>
                This example retrieves all functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms, InterPro entries and the lowest common ancestor associated with the protein <i><initialism>A0JP26</initialism></i> including the name of each <initialism>EC</initialism>-number, <initialism>GO</initialism>-term, the name and type of each InterPro entry, and its complete lineage.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/protinfo -d 'input[]=A0JP26' -d 'extra=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/protinfo.json?input[]=A0JP26&extra=true
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and lowest common ancestor associated with a single protein, making a distinction between different go-domains and InterPro types"
            :response="response5"
        >
            <template #description>
                This example retrieves all functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms, InterPro entries and the lowest common ancestor associated with the protein <i><initialism>A0JP26</initialism></i> distributed over the distinct <initialism>GO</initialism>-domains and InterPro types.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/protinfo -d 'input[]=A0JP26' -d 'domains=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/protinfo.json?input[]=A0JP26&domains=true
            </template>
        </example-card>

        <example-card
            class="mt-5"
            title="Retrieve the functional ec-numbers, go-terms, InterPro entries and lowest common ancestor associated with a single protein, including the names of all ranks in the lineage"
            :response="response6"
        >
            <template #description>
                This example retrieves all functional <initialism>EC</initialism>-numbers, <initialism>GO</initialism>-terms, InterPro entries and the lowest common ancestor associated with the protein <i><initialism>A0JP26</initialism></i> including the names of all ranks in the lineage.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/protinfo -d 'input[]=A0JP26' -d 'domains=true' -d 'names=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v2/protinfo.json?input[]=A0JP26&domains=true&names=true
            </template>
        </example-card>

        <try-it-card
            id="try"
            class="mt-5"
            :response="tryItResponse"
            command="protinfo"
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
                        v-model="domains"
                        color="primary"
                        inset
                        label="domains"
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
const response4 = ref({});
const response5 = ref({});
const response6 = ref({});

const input = ref("");
const equate_il = ref(false);
const extra = ref(false);
const domains = ref(false);
const names = ref(false);

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.peptinfo(input.value.split('\n'), equate_il.value, extra.value, domains.value);
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.protinfo(["A0JP26"]);
    response2.value = await unipeptCommunicator.protinfo(["A0JP26", "A0PK11"]);
    response4.value = await unipeptCommunicator.protinfo(["A0JP26"], true, undefined);
    response5.value = await unipeptCommunicator.protinfo(["A0JP26"], undefined, true);
    response6.value = await unipeptCommunicator.protinfo(["A0JP26"], true, undefined, true);
})
</script>

<style scoped>
.multi-column {
    columns: 3;
    -webkit-columns: 3;
    -moz-columns: 3;
}
</style>
