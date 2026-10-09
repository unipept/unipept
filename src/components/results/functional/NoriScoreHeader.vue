<template>
    <div
        class="v-data-table-header__content"
        style="white-space: nowrap;"
    >
        <span>{{ column.title }}</span>
        <!-- While the scores are computed, the spinner takes the place of the info icon so the header keeps its width -->
        <v-tooltip :text="tooltip">
            <template #activator="{ props }">
                <v-progress-circular
                    v-if="loading"
                    v-bind="props"
                    indeterminate
                    size="12"
                    width="2"
                    color="primary"
                    class="ml-1"
                />
                <v-btn
                    v-else-if="outdated"
                    v-bind="props"
                    icon
                    size="24"
                    variant="tonal"
                    color="primary"
                    class="ml-1"
                    @click.stop="emit('rerun')"
                >
                    <v-icon size="16">mdi-refresh</v-icon>
                </v-btn>
                <v-icon
                    v-else
                    v-bind="props"
                    size="x-small"
                    class="ml-1"
                >
                    mdi-information-outline
                </v-icon>
            </template>
        </v-tooltip>
        <v-icon
            class="v-data-table-header__sort-icon"
            :icon="getSortIcon(column)"
        />
    </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {MAX_SCORED_ANNOTATIONS} from "@/logic/processors/functional/FunctionalAnalysisProcessor";
import type {VDataTable} from "vuetify/components";

// The values that v-data-table gives to a header slot
type HeaderSlotProps = Parameters<NonNullable<VDataTable["$slots"][`header.${string}`]>>[0];

const { loading, outdated = false, annotation } = defineProps<{
    column: HeaderSlotProps["column"];
    getSortIcon: HeaderSlotProps["getSortIcon"];
    loading: boolean;
    // True if the scores do not belong to the current taxonomic filter
    outdated?: boolean;
    // Name of one annotation in the tooltip, for example "EC number"
    annotation: string;
}>();

const emit = defineEmits<{
    rerun: [];
}>();

const tooltip = computed(() => {
    if (loading) {
        return "Computing NORI scores...";
    }
    if (outdated) {
        return "These NORI scores were computed for a different taxonomic filter. Click to compute them for the peptides of the current filter.";
    }
    return `Score from NORI: a higher score means this ${annotation} is more likely correct. — means not scored (only the top ${MAX_SCORED_ANNOTATIONS} annotations get a score).`;
});
</script>
