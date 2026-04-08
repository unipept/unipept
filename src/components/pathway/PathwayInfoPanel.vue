<template>
    <div v-if="modelValue" class="info-panel-overlay">
        <v-card elevation="4" width="380" style="max-height: 450px; display: flex; flex-direction: column; overflow: hidden;">
            <!-- Fixed header: title + tabs (never scrolls) -->
            <div class="info-panel-header">
                <div class="text-body-2 pa-2 pb-1 d-flex align-center">
                    <span>{{ modelValue.type === 'area' ? 'Pathway Node' : 'Compound' }}</span>
                    <v-spacer />
                    <v-btn icon="mdi-close" size="x-small" density="compact" variant="text" @click="modelValue = null" />
                </div>
                <v-divider />
                <template v-if="modelValue.type === 'area' && hasNodeData">
                    <v-tabs v-model="activeTab" density="compact">
                        <v-tab value="overview" class="text-caption px-3">Overview</v-tab>
                        <v-tab v-if="modelValue.area.info?.ecNumbers?.length" value="ec" class="text-caption px-3">
                            EC ({{ modelValue.area.info.ecNumbers.length }})
                        </v-tab>
                        <v-tab v-if="modelValue.area.info?.koNumbers?.length" value="ko" class="text-caption px-3">
                            KO ({{ modelValue.area.info.koNumbers.length }})
                        </v-tab>
                        <v-tab v-if="modelValue.area.info?.reactions?.length" value="reactions" class="text-caption px-3">
                            Reactions ({{ modelValue.area.info.reactions.length }})
                        </v-tab>
                    </v-tabs>
                    <v-divider />
                </template>
            </div>

            <!-- Scrollable content (only this part scrolls) -->
            <v-card-text class="pa-2" style="overflow-y: auto; flex: 1; min-height: 0;">
                <template v-if="modelValue.type === 'area'">
                    <template v-if="hasNodeData">
                        <!-- Overview tab -->
                        <template v-if="activeTab === 'overview'">
                            <div class="text-caption text-medium-emphasis mb-1">Node contents</div>
                            <div class="d-flex flex-wrap ga-1 mb-3">
                                <v-chip v-if="modelValue.area.info?.ecNumbers?.length" size="x-small" label variant="tonal">
                                    EC: {{ modelValue.area.info.ecNumbers.length }}
                                </v-chip>
                                <v-chip v-if="modelValue.area.info?.koNumbers?.length" size="x-small" label variant="tonal">
                                    KO: {{ modelValue.area.info.koNumbers.length }}
                                </v-chip>
                                <v-chip v-if="modelValue.area.info?.reactions?.length" size="x-small" label variant="tonal">
                                    Reactions: {{ modelValue.area.info.reactions.length }}
                                </v-chip>
                            </div>

                            <!-- Per-taxon/group spectral count stats -->
                            <template v-if="areaStats">
                                <v-divider class="mb-2" />
                                <div class="text-caption text-medium-emphasis mb-2">Counts</div>
                                <div
                                    v-for="stat in areaStats"
                                    :key="stat.name"
                                    class="d-flex align-center ga-2 mb-1 text-caption"
                                >
                                    <span class="stat-circle" :style="{ background: stat.color }"></span>
                                    <span class="flex-grow-1">{{ stat.name }}</span>
                                    <span class="font-weight-medium">{{ stat.count }}/{{ stat.total }}</span>
                                    <span class="text-medium-emphasis">({{ displayPercentage(stat.count / stat.total) }})</span>
                                </div>
                            </template>

                        </template>

                        <!-- EC tab -->
                        <template v-else-if="activeTab === 'ec'">
                            <div v-for="ec in modelValue.area.info?.ecNumbers ?? []" :key="ec.id" class="mb-3">
                                <a
                                    :href="`https://www.genome.jp/entry/ec:${ec.id}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-caption font-weight-bold text-decoration-none text-primary"
                                >
                                    {{ ec.id }}
                                    <v-icon size="10" class="ml-1">mdi-open-in-new</v-icon>
                                </a>
                                <div class="text-caption">{{ ecMapping?.get(ec.id)?.names?.[0] ?? 'Unknown' }}</div>
                                <template v-if="getEcStats">
                                    <div
                                        v-for="stat in getEcStats(ec.id)"
                                        :key="stat.name"
                                        class="d-flex align-center ga-1 text-caption text-medium-emphasis"
                                    >
                                        <span class="stat-circle" :style="{ background: stat.color }"></span>
                                        {{ stat.name }}: {{ stat.matched }}/{{ stat.total }} ({{ displayPercentage(stat.matched / stat.total) }})
                                    </div>
                                </template>
                            </div>
                        </template>

                        <!-- KO tab -->
                        <template v-else-if="activeTab === 'ko'">
                            <div v-for="ko in modelValue.area.info?.koNumbers ?? []" :key="ko.id" class="mb-2">
                                <a
                                    :href="`https://www.genome.jp/entry/${ko.id}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-caption font-weight-bold text-decoration-none text-primary"
                                >
                                    {{ ko.id }}
                                    <v-icon size="10" class="ml-1">mdi-open-in-new</v-icon>
                                </a>
                            </div>
                        </template>

                        <!-- Reactions tab -->
                        <template v-else-if="activeTab === 'reactions'">
                            <div v-for="r in modelValue.area.info?.reactions ?? []" :key="r.id" class="mb-2">
                                <a
                                    :href="`https://www.genome.jp/entry/${r.id}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-caption font-weight-bold text-decoration-none text-primary"
                                >
                                    {{ r.id }}
                                    <v-icon size="10" class="ml-1">mdi-open-in-new</v-icon>
                                </a>
                            </div>
                        </template>
                    </template>
                    <span v-else class="text-caption text-medium-emphasis">No EC, KO, or reaction information available.</span>
                </template>

                <!-- Compound info -->
                <template v-else>
                    <a
                        :href="`https://www.genome.jp/entry/${compoundId}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-caption font-weight-bold text-decoration-none text-primary"
                    >
                        {{ compoundId }}
                        <v-icon size="10" class="ml-1">mdi-open-in-new</v-icon>
                    </a>
                    <div class="text-caption mt-1">
                        {{ compoundMapping?.get(compoundId)?.names?.[0] ?? 'Unknown' }}
                    </div>
                </template>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { EcInfo, CompoundInfo } from '@/logic/communicators/PathwayPilotCommunicator';
import usePercentage from '@/composables/usePercentage';

type InfoPanelData = { type: 'area'; area: any } | { type: 'compound'; compound: any };

const modelValue = defineModel<InfoPanelData | null>();

const props = defineProps<{
    ecMapping: Map<string, EcInfo> | undefined;
    compoundMapping?: Map<string, CompoundInfo> | undefined;
    getEcStats?: (ecId: string) => { name: string; color: string; matched: number; total: number }[];
    getAreaStats?: (area: any) => { name: string; color: string; count: number; total: number }[];
}>();

const { displayPercentage } = usePercentage();

const activeTab = ref<string>('overview');

const hasNodeData = computed(() => {
    if (modelValue.value?.type !== 'area') return false;
    const info = modelValue.value.area?.info;
    return !!(info?.ecNumbers?.length || info?.koNumbers?.length || info?.reactions?.length);
});

const compoundId = computed<string>(() => {
    if (modelValue.value?.type !== 'compound') return '';
    const compound = modelValue.value.compound;
    return compound?.info?.compounds?.[0]?.id ?? compound?.id ?? '';
});

const areaStats = computed(() => {
    if (!props.getAreaStats || modelValue.value?.type !== 'area') return null;
    return props.getAreaStats(modelValue.value.area);
});

watch(modelValue, (panel) => {
    if (panel?.type === 'area') {
        activeTab.value = 'overview';
    }
});
</script>

<style scoped>
.info-panel-overlay {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 10;
    pointer-events: all;
}

.stat-circle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
}

.info-panel-header {
    flex-shrink: 0;
}
</style>
