<template>
    <div v-if="!assay.status === AnalysisStatus.Running">
        <div class="display-1">
            Tryptic peptide analysis of {{ assay.peptide }}
        </div>
        <span class="subtitle-1">
            Computing summary...
        </span>
    </div>
    <div v-else>
        <div class="display-1">
            Tryptic peptide analysis of {{ assay.peptide }}
        </div>
        <div class="subtitle-1">
            {{ assay.peptide }} was found in
            <span class="font-weight-bold">{{ assay.proteins.length }}</span>
            UniProt entries with a lowest common ancestor of
            <span class="font-weight-bold">{{ lcaDefinition?.name }}</span>
        </div>
        <div class="subtitle-2">
            <span v-if="assay.config.equate">
                Equate I/L is enabled.
            </span>
            <span v-else>
                Equate I/L is disabled.
            </span>
        </div>
        <v-row>
            <v-col :cols="6">
                <div class="headline">
                    Biodiversity
                </div>
                <div v-if="assay.lca">
                    The <span class="font-weight-bold">lowest common ancestor</span> is
                    <a
                        :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${assay.lca}`"
                        target="_blank"
                        class="link primary--text"
                    >
                        {{ lcaDefinition?.name }}
                    </a> ({{ lcaDefinition?.rank }}).
                </div>
                <div>
                    The <span class="font-weight-bold">common lineage</span> for all these proteins is:
                    <span v-if="assay.commonLineage.length > 0">
                        <span
                            v-for="[idx, organismId] of assay.commonLineage.entries()"
                            :key="idx"
                        >
                            <a
                                v-if="organismId"
                                :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${organismId}`"
                                target="_blank"
                                class="link primary--text"
                            >
                                {{ getNcbiDefinition(organismId).name }}
                            </a>
                            <span v-else>
                                Unknown
                            </span>
                            <span v-if="idx + 1 < assay.commonLineage.length"> > </span>
                        </span>
                    </span>
                    <span v-else>
                        root
                    </span>
                </div>
            </v-col>
            <v-col :cols="6">
                <div class="headline">
                    Function
                </div>
                <div>
                    <span class="font-weight-bold">{{ assay.goTrust.annotatedItems }} proteins</span>
                    ({{ displayPercentage(assay.goTrust.annotatedItems / assay.goTrust.totalItems) }})
                    have at least one
                    <span
                        v-if="goLink"
                        class="link primary--text"
                        @click="goLinkClicked"
                    >
                        GO term
                    </span>
                    <span
                        v-else
                        class="font-weight-bold"
                    >
                        GO term
                    </span>
                    assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">{{ assay.ecTrust.annotatedItems }} proteins</span>
                    ({{ displayPercentage(assay.ecTrust.annotatedItems / assay.ecTrust.totalItems) }})
                    have at least one
                    <span
                        v-if="ecLink"
                        class="link primary--text"
                        @click="ecLinkClicked"
                    >
                        EC number
                    </span>
                    <span
                        v-else
                        class="font-weight-bold"
                    >
                        EC number
                    </span>
                    assigned to them.
                </div>

                <div>
                    <span class="font-weight-bold">
                        {{ assay.iprTrust.annotatedItems }} proteins
                    </span>
                    ({{ displayPercentage(assay.iprTrust.annotatedItems / assay.iprTrust.totalItems) }})
                    have at least one
                    <span
                        v-if="interproLink"
                        class="link primary--text"
                        @click="interproLinkClicked"
                    >
                        InterPro entry
                    </span>
                    <span
                        v-else
                        class="font-weight-bold"
                    >
                        InterPro entry
                    </span>
                    assigned to them.
                </div>
            </v-col>
        </v-row>
    </div>

</template>

<script setup lang="ts">
import {computed} from "vue";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";
import useOntologyStore from "@/store/new/OntologyStore";
import {PeptideAnalysisStore} from "@/store/new/PeptideAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";

export interface Props {
    assay: PeptideAnalysisStore
    goLink: boolean
    ecLink: boolean
    interproLink: boolean
}

const props = defineProps<Props>();

const emits = defineEmits(['goLinkClicked', 'ecLinkClicked', 'interproLinkClicked']);

const { getNcbiDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const lcaDefinition = computed(() => {
    return getNcbiDefinition(props.assay.lca)
});

const taxonomyUrl = (taxon: NcbiTaxon | undefined): string => {
    if (taxon === undefined || taxon.id === 1) {
        return 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi';
    }

    return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${taxon.id}`;
};

const goLinkClicked = () => {
    emits('goLinkClicked');
};

const ecLinkClicked = () => {
    emits('ecLinkClicked');
};

const interproLinkClicked = () => {
    emits('interproLinkClicked');
};
</script>

<style scoped>
a {
    text-decoration: none;
}

.link {
    text-decoration: none;
    cursor: pointer;
}
</style>