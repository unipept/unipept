<template>
    <v-card
        class="overflow-hidden"
        color="transparent"
        variant="flat"
        :height="height"
    >
        <h2 ref="header" class="mb-3 font-weight-light">
            Recent projects
        </h2>

        <v-card
            class="overflow-scroll"
            color="transparent"
            variant="flat"
            :height="height - headerHeight - 15"
        >
            <v-card
                v-for="(project, index) in visibleProjects"
                :key="project.id"
                class="project-card mb-1"
                @click="openProject(project)"
                variant="flat"
                density="compact"
            >
                <v-card-text class="d-flex align-center gap-2">
                    <v-icon size="20" class="me-3">mdi-folder-outline</v-icon>
                    <span>{{ project.name }}</span>
                </v-card-text>
            </v-card>

            <v-btn v-if="hasMore" variant="text" color="primary" @click="showMore">
                Show more
            </v-btn>
        </v-card>
    </v-card>
</template>

<script setup lang="ts">
import {ref, computed, watch, useTemplateRef} from 'vue'
import {useElementBounding} from "@vueuse/core";

const props = defineProps<{
    height: number
}>()

const projects = [
    { id: 1, name: 'Genome Analysis' },
    { id: 2, name: 'Protein Clustering' },
    { id: 3, name: 'Pathway Mapping' },
    { id: 4, name: 'Microbiome Study' },
    { id: 5, name: 'Cancer Genomics' },
    { id: 6, name: 'Peptide DB Search' },
    { id: 7, name: 'Metabolomics Explorer' },
    { id: 8, name: 'Antibiotic Resistance' },
    { id: 9, name: 'Soil Microbiome Survey' },
    { id: 9, name: 'Soil Microbiome Survey' },
    { id: 9, name: 'Soil Microbiome Survey' },
    { id: 9, name: 'Soil Microbiome Survey' },
    { id: 9, name: 'Soil Microbiome Survey' },
    { id: 9, name: 'Soil Microbiome Survey' },
]

const header = useTemplateRef('header');
const { height: headerHeight } = useElementBounding(header);

const visibleCount = ref(5)
const step = 5

const visibleProjects = computed(() => projects.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < projects.length)

function showMore() {
    visibleCount.value = Math.min(visibleCount.value + step, projects.length)
}

function openProject(project) {
    console.log('Opening project:', project)
}

watch(() => props.height, (newHeight) => {
    console.log('Height changed:', newHeight)
})
</script>

<style scoped>
.project-card {
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.project-card:hover {
    background-color: #E9F2FD; /* replace with your actual primary color */
    color: #4994EC;
}

.project-card:hover .v-icon {
    color: #4994EC;
}
</style>
