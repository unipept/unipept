<template>
    <div ref="barplotWrapper" style="height: 100%;">
        <barplot :bars="barData" :settings="barplotSettings" />
    </div>
</template>

<script setup lang="ts">
    import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
    import {Bar, BarItem} from "@/components/visualization/barplot/Bar";
    import {ref, Ref, onMounted, computed} from "vue";
    import Barplot from "@/components/visualization/barplot/Barplot.vue";
    import {BarplotSettings} from "@/components/visualization/barplot/BarplotSettings";

    const props = withDefaults(defineProps<{
        ncbiRoot: NcbiTreeNode
        width?: number
        height?: number
    }>(), {
        width: 800,
        height: 500
    });

    const barplotWrapper = ref<HTMLDivElement>();
    const containerWidth: Ref<number> = ref(props.width);
    const containerHeight: Ref<number> = ref(props.height);
    const barplotSettings: Ref<BarplotSettings> = ref(new BarplotSettings());
    const barData: Ref<Bar[]> = ref([]);

    const initializeSpeciesBar = () => {
        const nodesAtSpecies: NcbiTreeNode[] = [];
        props.ncbiRoot.callRecursivelyPostOrder((x: NcbiTreeNode) => {
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

        items.sort((a: BarItem, b: BarItem) => b.counts - a.counts);

        barData.value = [{
            items
        }];
    }


    onMounted(() => {
        const observer = new ResizeObserver(() => {
            containerWidth.value = barplotWrapper.value?.offsetWidth ?? props.width;
            containerHeight.value = barplotWrapper.value?.offsetHeight ?? props.height;

            barplotSettings.value.width = containerWidth.value;
            barplotSettings.value.height = containerHeight.value;
        });

        if (barplotWrapper.value) {
            observer.observe(barplotWrapper.value);
        }

        initializeSpeciesBar();
    })
</script>

<style scoped>

</style>