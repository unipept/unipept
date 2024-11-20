<template>
    <v-dialog
        v-model="dialogOpen"
        width="50%"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h1>{{ peptides.length }} missed peptides</h1>
                <v-spacer />
                <div class="justify-end">
                    <v-btn
                        icon="mdi-close"
                        variant="plain"
                        density="compact"
                        @click="dialogOpen = false"
                    />
                </div>
            </v-card-title>

            <v-card-text>
                <span>
                    Sorry, we didn't manage to find <b>{{ peptides.length }}</b> of your peptides. You can BLAST them by
                    clicking the links or copy them by using the button below.
                </span>

                <v-data-table-virtual
                    v-if="peptides.length > 0"
                    :headers="headers"
                    :items="peptideItems"
                    class="mt-3"
                    height="400"
                    item-value="name"
                    density="compact"
                    hide-default-header
                >
                    <template #item.action="{ item }">
                        <v-icon
                            size="small"
                            icon="mdi-open-in-new"
                            @click="blastPeptide(item.name)"
                        />
                    </template>

                    <template #bottom>
                        <v-btn
                            class="mt-3"
                            color="primary"
                            variant="tonal"
                            @click="copyToClipboard(peptides)"
                        >
                            Copy to clipboard
                        </v-btn>
                    </template>
                </v-data-table-virtual>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {computed} from "vue";

const dialogOpen = defineModel<boolean>();

const { peptides } = defineProps<{
    peptides: string[]
}>();

const peptideItems = computed(() => {
    return peptides.map(name => ({ name }));
});
</script>

<script lang="ts">
const headers = [
    { text: 'Peptide', value: 'name', width: '98%' },
    { text: '', value: 'action', width: '2%' }
];

const blastPeptide = (peptide: string) => {
    // TODO: change this. Hardcoded link to website for testing purposes
    const a = document.createElement('a');
    a.href = `http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on
        &USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=${peptide}&GAPCOSTS=11%201
        &EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr
        &BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3
        &MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on
        &ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100
        &DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false`;
    a.target = '_blank';
    a.click();
}

const copyToClipboard = (peptides: string[]) => {
    navigator.clipboard.writeText(peptides.join('\n'));
}
</script>

<style scoped>

</style>
