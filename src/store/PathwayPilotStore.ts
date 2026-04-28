import { ref, computed } from "vue";
import { defineStore } from "pinia";
import CountTable from "@/logic/processors/CountTable";
import usePathwayPilotMappingStore from "@/store/PathwayPilotMappingStore";
import usePathwayProcessor from "@/composables/processing/pathway/usePathwayProcessor";

export enum PathwayPilotStatus {
    Pending = "Pending",
    Loading = "Loading",
    Ready = "Ready",
    Failed = "Failed"
}

export interface PathwayItem {
    id: string;
    name: string;
    category: string;
    subCategory: string;
    count: number;
}

const usePathwayPilotStore = (sampleId: string) => defineStore(`pathwayPilotStore_${sampleId}`, () => {
    const mappingStore = usePathwayPilotMappingStore();

    const status = ref<PathwayPilotStatus>(PathwayPilotStatus.Pending);
    const _selectedPathwayId = ref<string | undefined>(undefined);

    const selectedPathway = computed<PathwayItem | undefined>(() => {
        if (!_selectedPathwayId.value) return undefined;
        const id = _selectedPathwayId.value;
        const info = mappingStore.pathwayMapping?.get(id);
        return {
            id,
            name: info?.name ?? '',
            category: info?.category ?? '',
            subCategory: info?.subCategory ?? '',
            count: pathwayToPeptideCounts.value.get(id) ?? 0
        };
    });

    const {
        ecs,
        compounds,
        pathways,
        ecToPeptideCount,
        pathwayToPeptideCounts,
        ecToPathways,
        compoundToPathways,
        process: processPathway
    } = usePathwayProcessor();

    const pathwayItems = computed<PathwayItem[]>(() => {
        const items: PathwayItem[] = [];
        for (const id of pathways.value) {
            const info = mappingStore.pathwayMapping?.get(id);
            if (info) {
                items.push({
                    id,
                    name: info.name,
                    category: info.category,
                    subCategory: info.subCategory,
                    count: pathwayToPeptideCounts.value.get(id) ?? 0
                });
            }
        }
        return items.sort((a, b) => b.count - a.count);
    });

    const initialize = async (
        ecToPeptides: Map<string, string[]>,
        peptidesTable: CountTable<string>
    ) => {
        if (status.value === PathwayPilotStatus.Ready || status.value === PathwayPilotStatus.Loading) {
            return;
        }

        status.value = PathwayPilotStatus.Loading;

        try {
            await mappingStore.fetchMappings();

            await processPathway(
                ecToPeptides,
                peptidesTable,
                mappingStore.ecMapping!,
                mappingStore.pathwayMapping!
            );

            status.value = PathwayPilotStatus.Ready;
        } catch (error) {
            status.value = PathwayPilotStatus.Failed;
            console.error("PathwayPilotStore initialization failed:", error);
        }
    };

    const setSelectedPathway = (pathway: PathwayItem | undefined) => {
        _selectedPathwayId.value = pathway?.id;
        if (pathway) {
            // Eagerly prefetch via the shared singleton cache so other samples benefit too.
            void usePathwayPilotMappingStore().getVisualizationData(pathway.id);
        }
    };

    /** Returns all pathway IDs that contain the given EC number. */
    const pathwaysForEc = (ecId: string): Set<string> => {
        return ecToPathways.value.get(ecId) ?? new Set();
    };

    /** Returns all pathway IDs that contain the given compound ID. */
    const pathwaysForCompound = (compoundId: string): Set<string> => {
        return compoundToPathways.value.get(compoundId) ?? new Set();
    };

    /** Returns the peptide spectral count for the given EC number (without "EC:" prefix). */
    const getEcCount = (ecId: string): number => {
        return ecToPeptideCount.value.get(ecId) ?? 0;
    };

    const reset = () => {
        status.value = PathwayPilotStatus.Pending;
        _selectedPathwayId.value = undefined;
        ecs.value = new Set();
        compounds.value = new Set();
        pathways.value = new Set();
        ecToPeptideCount.value = new Map();
        pathwayToPeptideCounts.value = new Map();
        ecToPathways.value = new Map();
        compoundToPathways.value = new Map();
    };

    const exportStore = (): PathwayPilotStoreImport | undefined => {
        if (_selectedPathwayId.value) {
            return { selectedPathwayId: _selectedPathwayId.value };
        }
        return undefined;
    };

    const setImportedData = (storeImport: PathwayPilotStoreImport) => {
        if (storeImport.selectedPathwayId) {
            _selectedPathwayId.value = storeImport.selectedPathwayId;
            // warm the mapping so selectedPathway.name is available immediately
            // If this function fails, it is not critical since the UI can handle missing names,
            // so we don't await it or change the status.
            void mappingStore.fetchMappings();
        }
    };

    return {
        status,
        selectedPathway,
        pathways,
        ecs,
        compounds,
        pathwayItems,

        initialize,
        setSelectedPathway,
        pathwaysForEc,
        pathwaysForCompound,
        getEcCount,
        reset,
        exportStore,
        setImportedData
    };
})();

export interface PathwayPilotStoreImport {
    selectedPathwayId: string;
}

export type PathwayPilotStore = ReturnType<typeof usePathwayPilotStore>;

export default usePathwayPilotStore;
