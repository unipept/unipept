<template>
    <v-container>
        <empty-project />
<!--        <v-row>-->
<!--            <v-col cols="6">-->
<!--                <quick-analysis-card />-->
<!--                <v-card-->
<!--                    class="mt-5"-->
<!--                    elevation="2"-->
<!--                >-->
<!--                    <v-card-title>-->
<!--                        <h2>Advanced analysis</h2>-->
<!--                    </v-card-title>-->
<!--                    <v-card-text>-->
<!--                        <p>-->
<!--                            Create a new project and analyze multiple samples or groups.-->
<!--                        </p>-->
<!--                        <v-btn-->
<!--                            class="mt-3"-->
<!--                            color="grey-lighten-3"-->
<!--                            text="Create new project"-->
<!--                        />-->
<!--                    </v-card-text>-->
<!--                </v-card>-->
<!--            </v-col>-->

<!--            <v-col cols="6">-->
<!--                <demo-analysis-card :samples="samples" />-->
<!--            </v-col>-->
<!--        </v-row>-->
    </v-container>
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import QuickAnalysisCard from "@/components/new/analysis/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/new/analysis/DemoAnalysisCard.vue";
import useSampleData from "@/composables/new/communication/unipept/useSampleData";
import {onMounted} from "vue";
import EmptyProject from "@/components/new/project/EmptyProject.vue";

const { samples, process } = useSampleData();

onMounted(() => {
    process();
});
</script>

<style scoped>

</style>
