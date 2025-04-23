<template>
    <v-unipept-card>
        <div ref="barplotWrapper" style="width: 100%;">
            <barplot :bars="bars" :settings="barplotSettings" />
        </div>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";
import {onMounted, ref, Ref} from "vue";
import {Bar, BarItem} from "@/components/visualization/barplot/Bar";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import Barplot from "@/components/visualization/barplot/Barplot.vue";
import {BarplotSettings} from "@/components/visualization/barplot/BarplotSettings";

const { project } = defineProps<{
    project: ProjectAnalysisStore
}>();

const barplotWrapper = ref<HTMLDivElement>();

const bars: Ref<Bar[]> = ref([]);
const barplotSettings: Ref<BarplotSettings> = ref(new BarplotSettings());

const computeBars = () => {
    // Get all samples from the project
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            const tree = analysis.ncbiTree;

            const nodesAtSpecies: NcbiTreeNode[] = [];
            tree.callRecursivelyPostOrder((x: NcbiTreeNode) => {
                if (x && x.extra.rank === "species") {
                    nodesAtSpecies.push(x);
                }
            });

            const items: BarItem[] = [];

            for (const speciesNode of nodesAtSpecies) {
                items.push({
                    label: speciesNode.name,
                    counts: speciesNode.count
                });
            }

            bars.value.push({
                label: analysis.name,
                items
            })
        }
    }
}

onMounted(() => {
    const observer = new ResizeObserver(() => {
        barplotSettings.value.width = barplotWrapper.value?.offsetWidth ?? 800;
        barplotSettings.value.height = 600;
    });

    if (barplotWrapper.value) {
        observer.observe(barplotWrapper.value);
    }

    computeBars();
});
</script>

<style scoped>

</style>