<template>
    <v-card>
        <v-card-title>
            {{ missedPeptides.length }} missed peptides
        </v-card-title>
        <v-card-text>
            <p>
                Sorry, we didn't manage to find <b>{{ missedPeptides.length }}</b> of your 
                peptides. You can BLAST them by clicking the links or copy them by using the button below.
            </p>

            <MissingPeptidesTable 
                :items="missedPeptides"
            />

            <div class="d-flex justify-center mt-3">
                <v-btn 
                    color="primary"
                    @click="copyMissedPeptides"
                >
                    <v-icon left>mdi-content-copy</v-icon> Copy all to clipboard
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { Peptide } from 'unipept-web-components/types';
import MissingPeptidesTable from '../tables/MissingPeptidesTable.vue';

export interface Props {
    missedPeptides: Peptide[]
}

/* eslint-disable */
const props = defineProps<Props>();

const copyMissedPeptides = () => {
    navigator.clipboard.writeText(props.missedPeptides.join('\n'));
}
</script>
