<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            bg-color="primary"
            slider-color="secondary"
        >
            <v-tab text="GO terms" />
            <v-tab text="EC numbers" />
            <v-tab text="InterPro entries" />

            <v-spacer />

            <v-menu>
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        class="align-self-center mr-4"
                        :text="sortPeptidePercentage ? 'Peptides %' : 'Peptides'"
                        variant="text"
                        prepend-icon="mdi-sort-descending"
                        append-icon="mdi-menu-down"
                    />
                </template>

                <v-list
                    class="grey-lighten-3"
                    density="compact"
                >
                    <v-list-item
                        density="compact"
                        class="menu-header"
                    >
                        Sort by number of peptides in related proteins
                        <v-btn
                            color="primary"
                            icon="mdi-help-circle"
                            variant="plain"
                            size="small"
                            @click="sortingPeptidesDialogOpen = true"
                        />
                    </v-list-item>
                    <v-list-item
                        title="Peptides %"
                        @click="sortPeptidePercentage = true"
                    />
                    <v-list-item
                        title="Peptides"
                        @click="sortPeptidePercentage = false"
                    />
                </v-list>
            </v-menu>
            <sorting-peptides-dialog v-model="sortingPeptidesDialogOpen" />
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item>
                    <functional-go-results
                        :analysis="analysis"
                        :show-percentage="sortPeptidePercentage"
                    />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <functional-ec-results
                        :analysis="analysis"
                        :show-percentage="sortPeptidePercentage"
                    />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <functional-ipr-results
                        :analysis="analysis"
                        :show-percentage="sortPeptidePercentage"
                    />
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {ref} from "vue";
import FunctionalGoResults from "@/components/new/results/go/FunctionalGoResults.vue";
import SortingPeptidesDialog from "@/components/new/results/SortingPeptidesDialog.vue";
import FunctionalEcResults from "@/components/new/results/ec/FunctionalEcResults.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import FunctionalIprResults from "@/components/new/results/ipr/FunctionalIprResults.vue";

defineProps<{
    analysis: SingleAnalysisStore
}>();

const currentTab = ref(0);
const sortPeptidePercentage = ref(false);
const sortingPeptidesDialogOpen = ref(false);
</script>

<style scoped>

</style>
