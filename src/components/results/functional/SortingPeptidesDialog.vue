<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="60%"
    >
        <v-unipept-card class="bg-mainBody">
            <v-card-title class="d-flex">
                Sorting functional annotations
                <v-spacer />
                <div class="justify-end">
                    <v-btn
                        icon="mdi-close"
                        variant="plain"
                        size="small"
                        density="compact"
                        @click="dialogOpen = false"
                    />
                </div>
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

                <v-btn
                    class="float-end mt-2"
                    color="primary"
                    variant="elevated"
                    @click="dialogOpen = false"
                >
                    I understand
                </v-btn>
            </v-card-text>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
const dialogOpen = defineModel({ default: false });
</script>