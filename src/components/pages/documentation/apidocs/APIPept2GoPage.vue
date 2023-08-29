<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>POST</initialism> /api/v1/pept2go
        </h1>
        <h3 class="font-weight-light">Returns the functional <initialism>GO</initialism>-terms associated with a given tryptic peptide.</h3>

        <v-divider class="my-2" />

        <p>
            This method returns the functional <initialism>GO</initialism>-terms associated with a given tryptic peptide. This is the same information as provided
            when performing a search with the <r-link to="/tpa" router>Tryptic Peptide Analysis</r-link> in the web interface.
        </p>

        <!-- Request Card -->
        <HeaderBodyCard id="request" title="Request">
            <p>
                The pept2go method can be used by doing a <initialism>HTTP POST</initialism>-request (preferred) or <initialism>GET</initialism>-request to
                <inline-code>https://api.unipept.ugent.be/api/v1/pept2go</inline-code>. <r-link to="#parameters" router>Parameters</r-link> can be included in the request body
                (<initialism>POST</initialism>) or in the query string (<initialism>GET</initialism>). The only required parameter is <inline-code>input[]</inline-code>, which
                takes one or more tryptic peptides.
            </p>

            <h3>input</h3>
            <p>
                <inline-code>input[]</inline-code> is a required parameter that takes one or more tryptic peptides. Unipept will return the functional
                <initialism>GO</initialism>-terms associated with each of the <inline-code>input[]</inline-code> peptides based on their occurrence in UniProt entries. To pass
                multiple peptides at once, simply add multiple <inline-code>input[]</inline-code> parameters (see <r-link to="#example2" router>example</r-link>).
            </p>

            <StaticAlert title="Input size">
                <p>
                    Unipept puts no restrictions on the number of peptides passed to the <inline-code>input[]</inline-code> parameter. Keep in mind that searching for lots of
                    peptides at once may cause the request to timeout or, in the case of a <initialism>GET</initialism>-request, exceed the maximum
                    <initialism>URL</initialism> length. When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each.
                </p>
            </StaticAlert>

            <h3>equate_il</h3>
            <p>
                <inline-code>equate_il</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>. When not set explicitly, the parameter
                defaults to <inline-code>false</inline-code>. When the parameter is set to <inline-code>true</inline-code>, isoleucine (I) and leucine (L) are equated when matching tryptic
                peptides to UniProt entries. This setting is similar to checking the <i>Equate I and L</i> checkbox when performing a search with the
                <r-link to="/tpa" router>Tryptic Peptide Analysis</r-link> in the web interface.
            </p>

            <h3>extra</h3>
            <p>
                <inline-code>extra</inline-code> is an optional parameter and can either be <inline-code>true</inline-code> or <inline-code>false</inline-code>. When not set explicitly, the parameter
                defaults to <inline-code>false</inline-code>. When the parameter is set to <inline-code>true</inline-code>, Unipept will also return the name associated with a
                <initialism>GO</initialism>-term. See the <r-link to="#response" router>response</r-link> section for an overview of the information fields returned.
            </p>

            <h3>domains</h3>
            <p>
                <inline-code>domains</inline-code> is an optional parameter that can be used to order the <initialism>GO</initialism>-terms in groups according to their
                namespace (cellular component, molecular function, biological process).
            </p>

            <StaticAlert title="Performance penalty">
                <p>
                    Setting <inline-code>extra</inline-code> or <inline-code>domains</inline-code> to <inline-code>true</inline-code> has a performance penalty inferred from additional database queries.
                    Do not use this parameter unless the extra information fields are needed.
                </p>
            </StaticAlert>
        </HeaderBodyCard>

        <!-- Response Card -->
        <HeaderBodyCard id="response" title="Response" class="mt-5">
            <p class="mb-2">
                A list of <initialism>JSON</initialism> objects is returned. By default, each object contains the following information fields:

                <ul class="my-3">
                    <li><inline-code>peptide</inline-code>: the peptide that was searched for.</li>
                    <li><inline-code>total_protein_count</inline-code>: total amount of proteins matched with the given peptide.</li>
                    <li><inline-code>go</inline-code>:
                        A list of <initialism>JSON</initialism> objects that each represent a <initialism>GO</initialism>-term associated with
                        the current tryptic peptide.
                        <ul>
                            <li><inline-code>go_term</inline-code>: <initialism>GO</initialism>-term associated with the current tryptic peptide.</li>
                            <li><inline-code>protein_count</inline-code>:
                                amount of proteins matched with the given tryptic peptide that are labeled with the current <initialism>GO</initialism>-term.
                            </li>
                            <li><inline-code>name</inline-code>:
                                optional, name of the <initialism>GO</initialism>-term. Included when the <inline-code>extra</inline-code> parameter is set to <inline-code>true</inline-code>.
                            </li>
                        </ul>
                    </li>
                </ul>

                When the <inline-code>domains</inline-code> parameter is set to <inline-code>true</inline-code>, objects are placed in a group corresponding to their namespace and the objects
                are nested in an additional object. See the examples for more information on how to use this.
            </p>
        </HeaderBodyCard>

        <!-- Parameters Card -->
        <HeaderBodyCard id="parameters" title="Parameters" class="mt-5">
            <!-- TODO: table component? -->
            <v-simple-table>
                <template #default>
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
                                Tryptic peptide to search for. Add multiple parameters to search for multiple peptides.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: String</div>
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
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <inline-code>true</inline-code> or <inline-code>false</inline-code> (default)</div>
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
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <inline-code>true</inline-code> or <inline-code>false</inline-code> (default)</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <b>domains</b>
                                <br>
                                <i style="font-size: 85%;">optional</i>
                            </td>
                            <td class="py-3">
                                Separates <initialism>GO</initialism>-namespaces and places objects in group associated with current namespace when <inline-code>true</inline-code>.
                                <br>
                                <div class="mt-3" style="font-size: 85%;">Value: Must be <inline-code>true</inline-code> or <inline-code>false</inline-code> (default)</div>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>

        <h2 id="examples" class="font-weight-light mt-10 mb-n2">Examples</h2>

        <ExampleCard
            title="Retrieve the functional go-terms associated with a given tryptic peptide"
            :response="response1"
        >
            <template #description>
                This example retrieves all functional <initialism>GO</initialism>-terms associated with the tryptic peptide
                <i><initialism>AIPQLEVARPADAYETAEAYR</initialism></i>. The result is the same as this search with the Tryptic Peptide Analysis in the web interface.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR
            </template>
        </ExampleCard>

        <ExampleCard
            id="example2"
            class="mt-5"
            title="Retrieve the functional go-terms associated with each of multiple tryptic peptides"
            :response="response2"
        >
            <template #description>
                This example retrieves the functional <initialism>GO</initialism>-terms for both the tryptic peptides <i><initialism>AIPQLEVARPADAYETAEAYR</initialism></i>
                and <i><initialism>APVLSDSSCK</initialism></i>. The result is the same as the combination of this search and this search with the Tryptic Peptide Analysis in
                the web interface.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'input[]=APVLSDSSCK'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR&input[]=APVLSDSSCK
            </template>
        </ExampleCard>

        <ExampleCard
            class="mt-5"
            title="Retrieve the functional go-terms associated with a single tryptic peptide, while equating I and L"
            :response="response3"
        >
            <template #description>
                This example retrieves the functional <initialism>GO</initialism>-terms associated with the tryptic peptide <i><initialism>APVLSDSSCK</initialism></i>.
                In searching, isoleucine (I) and leucinge (L) are considered equal. The result is the same as this search with the Tryptic Peptide Analysis in the
                web interface.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=APVISDSSCK' -d 'equate_il=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=APVISDSSCK&equate_il=true
            </template>
        </ExampleCard>

        <ExampleCard
            class="mt-5"
            title="Retrieve the functional go-terms associated with a single tryptic peptide, with extra information enabled"
            :response="response4"
        >
            <template #description>
                This example retrieves the functional <initialism>GO</initialism>-terms associated with the tryptic peptide
                <i><initialism>AIPQLEVARPADAYETAEAYR</initialism></i> including the name of each <initialism>GO</initialism>-term. The result is the same as this search
                with the Tryptic Peptide Analysis in the web interface.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'extra=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR&extra=true
            </template>
        </ExampleCard>

        <ExampleCard
            class="mt-5"
            title="Retrieve the functional go-terms associated with a single tryptic peptide, making a distinction between different domains"
            :response="response5"
        >
            <template #description>
                This example retrieves the functional <initialism>GO</initialism>-terms associated with the tryptic peptide <i><initialism>APVLSDSSCK</initialism></i>
                distributed over the distinct <initialism>GO</initialism>-domains. The result is the same as this search with the Tryptic Peptide Analysis in the web interface.
            </template>
            <template #post>
                curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=APVLSDSSCK' -d 'domains=true'
            </template>
            <template #get>
                https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=APVLSDSSCK&domains=true
            </template>
        </ExampleCard>

        <TryItCard id="try" class="mt-5" :response="tryItResponse" command="pept2go">
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
                    <v-col class="font-weight-bold" cols=4 sm=2>equate_il</v-col>
                    <v-col cols=8 sm=10>
                        <v-switch
                            class="pt-0 mt-0"
                            v-model="equate_il"
                            inset
                        ></v-switch>
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
                    <v-col class="font-weight-bold" cols=4 sm=2>domains</v-col>
                    <v-col cols=8 sm=10>
                        <v-switch
                            class="pt-0 mt-0"
                            v-model="domains"
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
import initialism from '@/components/highlights/initialism.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import ExampleCard from '@/components/cards/ExampleCard.vue';
import TryItCard from '@/components/cards/TryItCard.vue';
import r-link from '@/components/highlights/ResourceLink.vue';

const unipeptCommunicator = new UnipeptCommunicator();

const response1 = ref({});
const response2 = ref({});
const response3 = ref({});
const response4 = ref({});
const response5 = ref({});

const input = ref("");
const equate_il = ref(false);
const extra = ref(false);
const domains = ref(false);

const tryItResponse = ref({});

const doRequest = async () => {
    tryItResponse.value = await unipeptCommunicator.pept2go(input.value.split('\n'), equate_il.value, extra.value, domains.value);
}

onBeforeMount(async () => {
    response1.value = await unipeptCommunicator.pept2go(["AIPQLEVARPADAYETAEAYR"]);
    response2.value = await unipeptCommunicator.pept2go(["AIPQLEVARPADAYETAEAYR", "APVLSDSSCK"]);
    response3.value = await unipeptCommunicator.pept2go(["APVLSDSSCK"], true, undefined, undefined);
    response4.value = await unipeptCommunicator.pept2go(["AIPQLEVARPADAYETAEAYR"], undefined, true, undefined);
    response5.value = await unipeptCommunicator.pept2go(["APVLSDSSCK"], undefined, undefined, true);
})
</script>

<style scoped>

</style>
