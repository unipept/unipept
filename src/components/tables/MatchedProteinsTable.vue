<template>
    <v-card>
        <v-card-title>
            <v-text-field
                v-model="filter"
                append-icon="mdi-magnify"
                label="Filter"
                single-line
                hide-details
                variant="underlined"
            />
        </v-card-title>

        <v-card-text>

            <v-data-table
                v-model:expanded="expanded"
                :headers="headers"
                :items="items"
                item-value="uniprotAccessionId"
                :search="filter"
                :custom-filter="filterByValue"
                :loading="assay.status === AnalysisStatus.Running"
                show-expand
            >
                <template #item.uniprotAccessionId="{ item }" >
                    <span
                        style="cursor: pointer;"
                        @click="openInUniProt(item.uniprotAccessionId)"
                    >
                        <span style="position: relative; top: 4px;">
                            {{ item.uniprotAccessionId }}
                        </span>
                        <v-btn
                            icon="mdi-open-in-new"
                            size="x-small"
                            variant="plain"
                            style="float: right;"
                        />
                    </span>
                </template>
                <template #item.fa="{ item }">
                    <v-tooltip location="top">
                        <template #activator="{ props }">
                            <v-avatar
                                v-bind="props"
                                size="30"
                                :color="item.functionalAnnotations.go.length > 0 ? 'amber' : 'amber-lighten-4'"
                            >
                                <span
                                    :class="[item.functionalAnnotations.go.length > 0 ? 'dark--text' : 'gray--text', 'headline']"
                                    style="font-size: 14px !important;"
                                >
                                    GO
                                </span>
                            </v-avatar>
                        </template>
                        <span v-if="item.functionalAnnotations.go.length >= 0">
                            This protein is annotated with
                            <span
                                v-if="item.functionalAnnotations.go.length === 1"
                                class="font-weight-bold"
                            >
                                {{ item.functionalAnnotations.go.length }} GO-term.
                            </span>
                            <span
                                v-else
                                class="font-weight-bold"
                            >
                                {{ item.functionalAnnotations.go.length }} GO-terms.
                            </span>
                        </span>
                        <span v-else>
                            This protein is not annotated with GO-terms.
                        </span>
                    </v-tooltip>

                    <v-tooltip location="top">
                        <template #activator="{ props }">
                            <v-avatar
                                v-bind="props"
                                size="30"
                                :color="item.functionalAnnotations.ec.length > 0 ? 'indigo' : 'indigo-lighten-4'"
                            >
                                <span
                                    class="text-white"
                                    style="font-size: 14px !important;"
                                >
                                    EC
                                </span>
                            </v-avatar>
                        </template>
                        <span v-if="item.functionalAnnotations.ec.length >= 0">
                            This protein is annotated with
                            <span
                                v-if="item.functionalAnnotations.ec.length === 1"
                                class="font-weight-bold"
                            >
                                {{ item.functionalAnnotations.ec.length }} EC-number.
                            </span>
                            <span
                                v-else
                                class="font-weight-bold"
                            >
                                {{ item.functionalAnnotations.ec.length }} EC-numbers.
                            </span>
                        </span>
                        <span v-else>
                            This protein is not annotated with EC-numbers.
                        </span>
                    </v-tooltip>

                    <v-tooltip location="top">
                        <template #activator="{ props }">
                            <v-avatar
                                v-bind="props"
                                size="30"
                                :color="item.functionalAnnotations.interpro.length > 0 ? 'red' : 'red-lighten-4'"
                            >
                                <span
                                    class="text-white"
                                    style="font-size: 14px !important;"
                                >
                                    IPR
                                </span>
                            </v-avatar>
                        </template>
                        <span v-if="item.functionalAnnotations.interpro.length >= 0">
                            This protein is annotated with
                            <span
                                v-if="item.functionalAnnotations.interpro.length === 1"
                                class="font-weight-bold"
                            >
                                1 InterPro-entry.
                            </span>
                            <span
                                v-else
                                class="font-weight-bold"
                            >
                                {{ item.functionalAnnotations.interpro.length }} InterPro-entries.
                            </span>
                        </span>
                        <span v-else>
                            This protein is not annotated with InterPro-entries.
                        </span>
                    </v-tooltip>
                </template>

                <template #expanded-row="{ columns, item }">
                    <td
                        :colspan="columns.length"
                        style="padding-top: 12px; padding-bottom: 12px;"
                    >
                        <v-list
                            v-if="item.functionalAnnotations.go.length > 0 || item.functionalAnnotations.ec.length > 0 || item.functionalAnnotations.interpro.length > 0"
                            lines="two"
                        >
                            <v-list-subheader v-if="item.functionalAnnotations.go && item.functionalAnnotations.go.length > 0">
                                Gene Ontology terms
                            </v-list-subheader>
                            <v-list-item
                                v-for="definition of item.functionalAnnotations.go"
                                :key="definition.code"
                                :title="[definition.code, definition.name, definition.namespace].join(' - ')"
                                :subtitle="`Assigned to ${peptideData!.go[definition.code]} of ${peptideData!.faCounts.go} matched proteins with a GO annotation (${percentageForAnnotation(definition.code, 'go')}).`"
                            />
                            <v-list-subheader v-if="item.functionalAnnotations.ec && item.functionalAnnotations.ec.length > 0">
                                Enzyme Commission numbers
                            </v-list-subheader>
                            <v-list-item
                                v-for="definition of item.functionalAnnotations.ec"
                                :key="definition.code"
                                :title="[definition.code.substring(3), definition.name, definition.namespace].join(' - ')"
                                :subtitle="`Assigned to ${peptideData!.ec[definition.code]} of ${peptideData!.faCounts.ec} matched proteins with an EC annotation (${percentageForAnnotation(definition.code, 'ec')}).`"
                            />
                            <v-list-subheader v-if="item.functionalAnnotations.interpro && item.functionalAnnotations.interpro.length > 0">
                                InterPro entries
                            </v-list-subheader>
                            <v-list-item
                                v-for="definition of item.functionalAnnotations.interpro"
                                :key="definition.code"
                                :title="[definition.code.substring(4), definition.name, definition.namespace].join(' - ')"
                                :subtitle="`Assigned to ${peptideData!.ipr[definition.code]} of ${peptideData!.faCounts.ipr} matched proteins with an InterPro annotation (${percentageForAnnotation(definition.code, 'ipr')}).`"
                            />
                        </v-list>
                        <div
                            v-else
                        >
                            <v-alert
                                variant="tonal"
                                density="compact"
                                type="warning"
                            >
                                There are no functional annotations available for this protein.
                            </v-alert>
                        </div>
                    </td>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, Ref, ComputedRef} from 'vue';
import FunctionalDefinition from "@/logic/new/ontology/functional/FunctionalDefinition";
import {PeptideData} from "unipept-web-components";
import {PeptideAnalysisStore} from "@/store/new/PeptideAnalysisStore";
import useOntologyStore from "@/store/new/OntologyStore";
import NetworkUtils from "@/logic/communicators/NetworkUtils";
import useStringUtils from "@/composables/new/useStringUtils";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";

type MatchedProtein = {
    uniprotAccessionId: string,
    name: string,
    organism: string,
    functionalAnnotations: {
        go: FunctionalDefinition[],
        ec: FunctionalDefinition[],
        interpro: FunctionalDefinition[]
    },
    totalAnnotations: number
};

export interface Props {
    assay: PeptideAnalysisStore
}

const props = defineProps<Props>();

// TODO: remove any type whenever Vuetify exposes type of DataTableHeader...
const headers: any = ref([
    {
        title: "UniProt ID",
        align: "start",
        key: "uniprotAccessionId",
        width: "20%"
    },
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "29%"
    },
    {
        title: "Organism",
        align: "start",
        key: "organism",
        width: "30%"
    },
    {
        title: "Annotations",
        align: "start",
        key: "fa",
        width: "16%",
        sortable: false
    },
    {
        title: "",
        key: "data-table-expand",
        width: "5%"
    },
]);

const items: Ref<MatchedProtein[]> = ref([]);

const computeItems = async () => {
    const ontologyStore = useOntologyStore();
    items.value = props.assay.proteins.map(p => {
        const organism = ontologyStore.getNcbiDefinition(p.organism);

        const goTerms = p.goTerms.map((term: string) => ontologyStore.getGoDefinition(term)).filter(e => e);
        const ecTerms = p.ecNumbers.map((term: string) => ontologyStore.getEcDefinition(`EC:${term}`)).filter(e => e);
        const iprTerms = p.interproEntries.map((term: string) => ontologyStore.getIprDefinition(`IPR:${term}`)).filter(e => e);

        return {
            uniprotAccessionId: p.uniprotAccessionId,
            name: p.name,
            organism: organism ? organism.name : "",
            functionalAnnotations: {
                go: goTerms,
                ec: ecTerms,
                interpro: iprTerms,
            },
            totalAnnotations: goTerms.length + ecTerms.length + iprTerms.length
        } as MatchedProtein;
    });
}

const peptideData: ComputedRef<PeptideData | undefined> = computed(() => {
    return props.assay.peptideToData!.get(props.assay.peptide);
});

const filter = ref<string>("");
const expanded = ref<string[]>([]);

// Implemented by Vuetify (see docs), but not exposed in their library
export interface InternalItem<T = any> {
    value: any
    raw: T
}

const filterByValue = (value: any, search: string, internalItem?: InternalItem<MatchedProtein>) => {
    if (!internalItem || !search) {
        return true;
    }

    search = search.toLowerCase();

    const item: MatchedProtein = internalItem.raw;

    return item.name.toLowerCase().includes(search) ||
        item.uniprotAccessionId.toLowerCase().includes(search) ||
        item.organism.toLowerCase().includes(search) ||
        item.functionalAnnotations.go.some(e => e.name.toLowerCase().includes(search) || e.code.toLowerCase().includes(search)) ||
        item.functionalAnnotations.interpro.some(e => e.name.toLowerCase().includes(search) || e.code.toLowerCase().includes(search)) ||
        item.functionalAnnotations.ec.some(e => e.name.toLowerCase().includes(search) || e.code.toLowerCase().includes(search));
};

const openInUniProt = (accessionId: string): void => {
    NetworkUtils.openInBrowser(`https://www.uniprot.org/uniprot/${accessionId}`);
}

/**
 * Returns how many of the total peptides of a specific annotation type (e.g. EC, GO or IPR) is annotated with a
 * concrete annotation (e.g. GO:005782).
 *
 * @param annotationCode The concrete annotation for which the annotation percentage should be computed.
 * @param annotationType The type of annotation that was given. Must be one of GO, EC, IPR.
 */
const percentageForAnnotation = (annotationCode: string, annotationType: ("go" | "ec" | "ipr")) => {
    const { numberToPercent } = useStringUtils();
    return numberToPercent(peptideData.value![annotationType][annotationCode] / peptideData.value!.faCounts[annotationType]);
}

onMounted(() => {
    computeItems();
})
</script>

<style scoped>
.no-peptide-data-alert .v-alert {
    margin-bottom: 0 !important;
}
.gray--text {
    color: rgba(0, 0, 0, 0.2);
}
</style>