<template>
    <div>
        <v-data-table
            :headers="headers"
            :loading="!items"
            :items="itemObjects"
            :itemsPerPage="10"
        >
            <template #item.peptide="{ item }">
                <span>{{ item.peptide }}</span>
            </template>

            <template #item.action="{ item }">
                <a :href="url(item.peptide)" target="_blank" class="font-regular d-flex">
                    <v-icon class="pl-2">mdi-open-in-new</v-icon>
                </a>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { Peptide } from 'unipept-web-components';
import { computed } from 'vue';

export interface Props {
    items: Peptide[]
}

/* eslint-disable */
const props = defineProps<Props>();

const headers = [
    {
        text: "Peptide",
        align: "start",
        value: "peptide",
        width: "90%"
    },
    {
        text: "Actions",
        align: "center",
        value: "action",
        width: "10%",
        sortable: false
    }
];

const itemObjects = computed(() => {
    return props.items.map((item) => {
        return {
            peptide: item
        };
    });
});

const url = (peptide: Peptide) => {
    return "http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on" +
        "&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=" + peptide + "&GAPCOSTS=11%201" +
        "&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr" +
        "&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3" +
        "&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on" +
        "&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100" +
        "&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false"
}
</script>

<style scoped>
    a {
        text-decoration: none;
    }

    a:hover {
        text-decoration: none;
    }
</style>
