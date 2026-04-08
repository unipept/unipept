<template>
    <div ref="fullscreenRoot">
        <visualization-controls
            :caption="!viz.loading.value ? 'Scroll to zoom, drag to pan, click a node to reveal additional information' : undefined"
            :download="!viz.loading.value && !isFullscreen ? () => viz.downloadDialogOpen.value = true : undefined"
            :reset="viz.imageLoaded.value ? viz.resetView : undefined"
            :fullscreen="!viz.loading.value ? toggleFullscreen : undefined"
        >
            <template #visualization>
                <div
                    :class="{ 'd-flex flex-column': isFullscreen }"
                    :style="{ paddingTop: viz.loading.value ? 0 : '40px', height: isFullscreen ? '100%' : 'auto' }"
                >
                    <!-- Settings expansion panel -->
                    <div v-show="!viz.loading.value" class="mx-4 mt-3 mb-3">
                        <v-expansion-panels color="grey-lighten-4" v-model="settingsPanelOpen">
                            <v-expansion-panel value="settings">
                                <v-expansion-panel-title>
                                    <v-icon class="mr-2">mdi-cog</v-icon>
                                    PathwayPilot settings
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <slot name="settings" />
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        <v-alert
                            v-if="crowdingWarning"
                            type="warning"
                            variant="tonal"
                            density="compact"
                            class="mt-2"
                        >
                            More than 6 groups are active. The visualization may become too crowded to interpret clearly.
                        </v-alert>
                    </div>

                    <template v-if="viz.loading.value">
                        <v-card-text>
                            <div class="px-4 pt-1 pb-2">
                                <span class="text-h6">{{ selectedPathway?.id }}: {{ selectedPathway?.name }}</span>
                            </div>
                            <v-progress-linear indeterminate color="primary" />
                            <div class="d-flex justify-center py-6">
                                <span class="text-body-2 text-medium-emphasis">Loading pathway visualization...</span>
                            </div>
                        </v-card-text>
                    </template>

                    <v-alert v-else-if="viz.error.value" type="error" variant="tonal" class="ma-4">
                        <div>Failed to load pathway visualization.</div>
                        <v-btn variant="tonal" class="mt-3" prepend-icon="mdi-refresh" @click="emit('retry')">
                            Try again
                        </v-btn>
                    </v-alert>

                    <div
                        v-else-if="viz.pngUrl.value"
                        :ref="(el) => { viz.vizWrapper.value = el as HTMLElement }"
                        class="pathway-wrapper"
                        :style="isFullscreen ? { flex: '1', minHeight: '0' } : { height: viz.containerHeight.value + 'px' }"
                    >
                        <pathway-interactive-image
                            v-model:scale="viz.scale.value"
                            v-model:translate="viz.translate.value"
                            style="width: 100%; height: 100%;"
                        >
                            <div style="position: relative; display: inline-block;">
                                <img
                                    :ref="(el) => { viz.imgRef.value = el as HTMLImageElement }"
                                    :src="viz.pngUrl.value"
                                    alt="Pathway visualization"
                                    style="display: block; max-width: none;"
                                    @load="viz.onImageLoad()"
                                />
                                <pathway-image-overlay
                                    v-if="viz.imageLoaded.value"
                                    :ref="(el) => { viz.overlayRef.value = el as any }"
                                    :areas="coloredAreas"
                                    :scale="1"
                                    :style="{ width: viz.imgWidth.value + 'px', height: viz.imgHeight.value + 'px' }"
                                    @click:area="viz.onAreaClick"
                                    @click:compound="viz.onCompoundClick"
                                />
                            </div>
                        </pathway-interactive-image>

                        <pathway-legend
                            :items="legendItems"
                            :show-differential="showDifferential"
                            :differential-labels="differentialLabels"
                            :differential-colors="differentialColors"
                        />

                        <!-- Info panel overlay -->
                        <pathway-info-panel
                            v-model="viz.infoPanel.value"
                            :ec-mapping="viz.mappingStore.ecMapping"
                            :compound-mapping="viz.mappingStore.compoundMapping"
                            :get-ec-stats="getEcStats"
                            :get-area-stats="getAreaStats"
                        />
                    </div>

                    <!-- Bottom actions -->
                    <template v-if="!viz.loading.value && !isFullscreen">
                        <v-divider />
                        <div class="d-flex pa-2">
                            <v-btn
                                variant="tonal"
                                prepend-icon="mdi-arrow-left"
                                @click="emit('back')"
                            >
                                Select a different pathway
                            </v-btn>
                            <v-spacer />
                            <v-menu v-if="showCsvExport">
                                <template #activator="{ props: menuProps }">
                                    <v-btn
                                        v-bind="menuProps"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-download"
                                        append-icon="mdi-chevron-down"
                                    >
                                        Export
                                    </v-btn>
                                </template>
                                <v-list density="compact">
                                    <v-list-item density="compact" @click="emit('export-csv', ',')">Comma separated (CSV)</v-list-item>
                                    <v-list-item density="compact" @click="emit('export-csv', ';')">Semicolon separated (CSV)</v-list-item>
                                    <v-list-item density="compact" @click="emit('export-csv', '\t')">Tab separated (TSV)</v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                </div>
            </template>
        </visualization-controls>

        <pathway-download-dialog
            v-model="viz.downloadDialogOpen.value"
            :png-url="viz.pngUrl.value ?? ''"
            :overlay-el="(viz.overlayRef.value as any)?.$el ?? null"
            :img-width="viz.imgWidth.value"
            :img-height="viz.imgHeight.value"
            :scale="viz.scale.value"
            :translate="viz.translate.value"
            :container-width="viz.containerWidth.value"
            :container-height="viz.containerHeight.value"
            :legend-entries="legendEntriesForDialog"
            :is-differential="showDifferential"
            :filename="selectedPathway?.name ?? 'pathway'"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFullscreen } from '@vueuse/core';
import type { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import type { PathwayItem } from '@/store/PathwayPilotStore';
import PathwayInteractiveImage from '@/components/pathway/PathwayInteractiveImage.vue';
import PathwayImageOverlay from '@/components/pathway/PathwayImageOverlay.vue';
import PathwayInfoPanel from '@/components/pathway/PathwayInfoPanel.vue';
import PathwayDownloadDialog from '@/components/pathway/PathwayDownloadDialog.vue';
import VisualizationControls from '@/components/results/taxonomic/VisualizationControls.vue';
import PathwayLegend from "@/components/pathway/PathwayLegend.vue";

const props = defineProps<{
    viz: ReturnType<typeof usePathwayVisualization>;
    coloredAreas: any[];
    selectedPathway: PathwayItem | undefined;
    legendItems: { label: string; color: string }[];
    showDifferential: boolean;
    differentialLabels?: [string, string];
    differentialColors?: [string, string];
    getEcStats?: (ecId: string) => { name: string; color: string; matched: number; total: number }[];
    getAreaStats?: (area: any) => { name: string; color: string; count: number; total: number }[];
    showCsvExport?: boolean;
    crowdingWarning?: boolean;
}>();

const emit = defineEmits<{
    back: [];
    'export-csv': [delimiter: string];
    retry: [];
}>();

const settingsPanelOpen = ref<string[]>([]);
const fullscreenRoot = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(fullscreenRoot);

const legendEntriesForDialog = computed(() =>
    props.legendItems.map(item => ({ name: item.label, color: item.color }))
);
</script>

<style scoped>
.pathway-wrapper {
    width: 100%;
    background: white;
    position: relative;
}
</style>
