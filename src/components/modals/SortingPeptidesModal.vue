<template>
    <v-dialog v-model="dialogOpen" max-width="600">
        <template v-slot:activator="{ on }">
            <v-icon right v-on="on">mdi-help-circle</v-icon>
        </template>

        <v-card>
            <v-card-title>
                <v-icon left>mdi-help-circle</v-icon> Sorting functional annotations
            </v-card-title>
            <v-card-text>
                <p>The functional annotations can be sorted on two metrics:</p>
                <ul>
                    <li>
                        <strong>Peptides</strong>:
                        The absolute number of peptides that are associated with a given
                        functional annotation.
                    </li>
                    <li>
                        <strong>Peptides%</strong>:
                        Like peptides, but the reported value is represented as a percentage
                        indicating the fraction of the total number of peptides.
                    </li>
                </ul>
                <p>
                    <br>
                    Your "Filter duplicate peptides" setting is taken into account. If it is
                    enabled, peptides that occur multiple times in your input list are
                    counted that many times.
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="dialogOpen = false">
                    I understand
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dialogOpen = ref<boolean>(false);
</script>
