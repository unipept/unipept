<template>
    <div class="lineage-table">
        <v-card>
            <v-card-text>
                <p>
                    This table shows the complete taxonomic lineages of all taxa associated with the UniProt entries
                    whose protein sequence contains the tryptic peptide. The first column contains the taxon name
                    extracted from the UniProt entry, followed by columns representing taxonomic ranks ordered from
                    domain on the left to forma on the right.
                </p>

                <v-data-table
                    density="compact"
                    :items="items"
                    :headers="headers"
                    :loading="assay.status === AnalysisStatus.Running"
                    :footer-props="{
                        'items-per-page-options': [10, 20, 50, 100, -1]
                    }"
                >
                    <template #body="{ items }">
                        <tbody>
                            <tr
                                v-for="item in items"
                                :key="item.definition.name"
                            >
                                <td>
                                    <span class="font-small font-weight-bold">
                                        {{ item.definition.name }}
                                    </span>
                                </td>
                                <td
                                    v-for="l in item.lineage"
                                    :key="l ? l.id : generateId()"
                                    :class="[ l ? getColour(l.name) : '', 'lineage-cell', 'px-2']"
                                >
                                    <a
                                        v-if="l"
                                        class="font-small font-weight-regular font-text no-link-colour"
                                        :href="'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=' + l.id"
                                        target="_blank"
                                    >
                                        {{ l.name }}
                                        <v-icon size="x-small">mdi-open-in-new</v-icon>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, ComputedRef, Ref } from 'vue';
import {PeptideAnalysisStore} from "@/store/PeptideAnalysisStore";
import {NcbiRank, NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import useOntologyStore from "@/store/OntologyStore";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import Protein from "@/logic/ontology/proteins/Protein";

export interface Props {
    assay: PeptideAnalysisStore
}

const props = defineProps<Props>();

const headers: ComputedRef<any> = computed(() => {
    const headers = [{
        title: "Organism",
        key: "name",
        width: "200px"
    }];

    headers.push(...Object.values(NcbiRank).map((v: string) => {
        return { title: v, key: "lineage" + v, width: "150px" }
    }));

    return headers;
});

const usedColours: Map<string, string> = new Map();
const colourCounter = ref<number>(0);

const items: ComputedRef<{ definition: NcbiTaxon, lineage: (NcbiTaxon | undefined)[] }[]> = computed(() => {
    const ontologyStore = useOntologyStore();
    const results: { definition: NcbiTaxon, lineage: (NcbiTaxon | undefined)[] }[] = [];

    props.assay.proteins.forEach((p: Protein) => {
        const def = ontologyStore.getNcbiDefinition(p.taxonId);

        if (def) {
            results.push({
                definition: def,
                lineage: def.lineage.map((l: number) => ontologyStore.getNcbiDefinition(l))
            });
        }
    });

    return results;
});


const getColour = (name: string): string => {
    if (!usedColours.has(name)) {
        usedColours.set(name, "c" + (colourCounter.value % 30));
        colourCounter.value++;
    }

    return usedColours.get(name)!;
}

const generateId = (): string => {
    return Math.random().toString();
}
</script>

<style scoped>
.lineage-table .no-link-colour {
    color: rgba(0, 0, 0, 0.87);
}

.lineage-table .no-link-colour:hover {
    text-decoration: none;
}

.lineage-table .font-small {
    font-size: 10px;
}

.lineage-table table {
    table-layout: fixed;
}

.lineage-table tbody {
    display: contents;
}

.lineage-cell {
    height: 50px;
}

/* All colors that are used in the LineageTable */
.c0 {
    background: #f9f0ab !important;
}
.c1 {
    background: #e8e596 !important;
}
.c2 {
    background: #f0e2a3 !important;
}
.c3 {
    background: #ede487 !important;
}
.c4 {
    background: #efd580 !important;
}
.c5 {
    background: #f1cb82 !important;
}
.c6 {
    background: #f1c298 !important;
}
.c7 {
    background: #e8b598 !important;
}
.c8 {
    background: #d5dda1 !important;
}
.c9 {
    background: #c9d2b5 !important;
}
.c10 {
    background: #aec1ad !important;
}
.c11 {
    background: #a7b8a8 !important;
}
.c12 {
    background: #b49a3d !important;
}
.c13 {
    background: #b28647 !important;
}
.c14 {
    background: #a97d32 !important;
}
.c15 {
    background: #b68334 !important;
}
.c16 {
    background: #d6a680 !important;
}
.c17 {
    background: #dfad70 !important;
}
.c18 {
    background: #a2765d !important;
}
.c19 {
    background: #9f6652 !important;
}
.c20 {
    background: #b9763f !important;
}
.c21 {
    background: #bf6e5d !important;
}
.c22 {
    background: #af643c !important;
}
.c23 {
    background: #9b4c3f !important;
}
.c24 {
    background: #72659d !important;
}
.c25 {
    background: #8a6e9e !important;
}
.c26 {
    background: #8f5c85 !important;
}
.c27 {
    background: #934b8b !important;
}
.c28 {
    background: #9d4e87 !important;
}
.c29 {
    background: #92538c !important;
}
</style>