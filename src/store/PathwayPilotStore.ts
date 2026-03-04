import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import CountTable from "@/logic/processors/CountTable";
import usePathwayPilotMappingStore from "@/store/PathwayPilotMappingStore";

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
    const status = ref<PathwayPilotStatus>(PathwayPilotStatus.Pending);
    const selectedPathway = ref<PathwayItem | undefined>(undefined);

    // Pathway ID saved during setImportedData, resolved into a full PathwayItem
    // at the end of initialize() once the mapping has been loaded.
    const _pendingImportedPathwayId = ref<string | undefined>(undefined);

    // Pathway counts: reactive so computed pathwayItems updates
    const _pathwayToPeptideCounts = reactive<Map<string, number>>(new Map());

    // EC numbers found in this sample (WITHOUT "EC:" prefix for KEGG compatibility)
    const ecs = ref<Set<string>>(new Set());

    // Compound IDs found in pathways that have matching ECs
    const compounds = ref<Set<string>>(new Set());

    // EC → pathway IDs (built from ecMapping.pathways during initialize)
    const _ecToPathways = reactive<Map<string, Set<string>>>(new Map());

    // Compound → pathway IDs (built from pathwayMapping.compoundIds during initialize)
    const _compoundToPathways = reactive<Map<string, Set<string>>>(new Map());

    // EC → peptide spectral counts (without "EC:" prefix)
    const _ecToPeptideCount = new Map<string, number>();

    // Set of matched pathway IDs (only pathways where this sample has at least one matching EC)
    const pathways = ref<Set<string>>(new Set());

    const pathwayItems = computed<PathwayItem[]>(() => {
        const mappingStore = usePathwayPilotMappingStore();
        const items: PathwayItem[] = [];
        for (const id of pathways.value) {
            const info = mappingStore.pathwayMapping?.get(id);
            if (info) {
                items.push({
                    id,
                    name: info.name,
                    category: info.category,
                    subCategory: info.subCategory,
                    count: _pathwayToPeptideCounts.get(id) ?? 0
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
            const mappingStore = usePathwayPilotMappingStore();
            await mappingStore.fetchMappings();

            _pathwayToPeptideCounts.clear();
            _ecToPathways.clear();
            _compoundToPathways.clear();
            pathways.value = new Set();
            ecs.value = new Set();
            compounds.value = new Set();
            _ecToPeptideCount.clear();

            // Step 1: Build EC set and per-EC spectral counts (strip "EC:" prefix)
            for (const [rawEc, peptideList] of ecToPeptides.entries()) {
                const ecId = rawEc.startsWith("EC:") ? rawEc.substring(3) : rawEc;
                ecs.value.add(ecId);
                let count = 0;
                for (const peptide of peptideList) {
                    count += peptidesTable.counts.get(peptide) ?? 1;
                }
                _ecToPeptideCount.set(ecId, count);
            }

            // Step 2: Use ecMapping.pathways to build EC→pathways and pathway peptide counts
            // This avoids fetching individual pathway visualizations for counting
            if (mappingStore.ecMapping) {
                for (const ecId of ecs.value) {
                    const ecInfo = mappingStore.ecMapping.get(ecId);
                    if (!ecInfo?.pathways?.length) continue;

                    const ecCount = _ecToPeptideCount.get(ecId) ?? 0;

                    if (!_ecToPathways.has(ecId)) {
                        _ecToPathways.set(ecId, new Set());
                    }

                    for (const pathwayEntry of ecInfo.pathways) {
                        const pathwayId = pathwayEntry.id;

                        _ecToPathways.get(ecId)!.add(pathwayId);
                        pathways.value.add(pathwayId);

                        // Accumulate peptide counts for this pathway
                        _pathwayToPeptideCounts.set(
                            pathwayId,
                            (_pathwayToPeptideCounts.get(pathwayId) ?? 0) + ecCount
                        );
                    }
                }
            }

            // Step 3: Use pathwayMapping.compoundIds to build compound→pathway mapping
            if (mappingStore.pathwayMapping) {
                for (const pathwayId of pathways.value) {
                    const pathwayInfo = mappingStore.pathwayMapping.get(pathwayId);
                    if (!pathwayInfo?.compoundIds?.length) continue;

                    for (const compoundId of pathwayInfo.compoundIds) {
                        compounds.value.add(compoundId);
                        if (!_compoundToPathways.has(compoundId)) {
                            _compoundToPathways.set(compoundId, new Set());
                        }
                        _compoundToPathways.get(compoundId)!.add(pathwayId);
                    }
                }
            }

            status.value = PathwayPilotStatus.Ready;

            // Restore a previously selected pathway from an imported session.
            if (_pendingImportedPathwayId.value) {
                const id = _pendingImportedPathwayId.value;
                const info = mappingStore.pathwayMapping?.get(id);
                if (info) {
                    selectedPathway.value = {
                        id,
                        name: info.name,
                        category: info.category,
                        subCategory: info.subCategory,
                        count: _pathwayToPeptideCounts.get(id) ?? 0
                    };
                }
                _pendingImportedPathwayId.value = undefined;
            }
        } catch (error) {
            status.value = PathwayPilotStatus.Failed;
            console.error("PathwayPilotStore initialization failed:", error);
        }
    };

    const setSelectedPathway = (pathway: PathwayItem | undefined) => {
        selectedPathway.value = pathway;
        if (pathway) {
            // Eagerly prefetch via the shared singleton cache so other samples benefit too.
            void usePathwayPilotMappingStore().getVisualizationData(pathway.id);
        }
    };

    /** Returns all pathway IDs that contain the given EC number. */
    const pathwaysForEc = (ecId: string): Set<string> => {
        return _ecToPathways.get(ecId) ?? new Set();
    };

    /** Returns all pathway IDs that contain the given compound ID. */
    const pathwaysForCompound = (compoundId: string): Set<string> => {
        return _compoundToPathways.get(compoundId) ?? new Set();
    };

    /** Returns the peptide spectral count for the given EC number (without "EC:" prefix). */
    const getEcCount = (ecId: string): number => {
        return _ecToPeptideCount.get(ecId) ?? 0;
    };

    const reset = () => {
        status.value = PathwayPilotStatus.Pending;
        selectedPathway.value = undefined;
        _pendingImportedPathwayId.value = undefined;
        pathways.value = new Set();
        ecs.value = new Set();
        compounds.value = new Set();
        _ecToPeptideCount.clear();
        _pathwayToPeptideCounts.clear();
        _ecToPathways.clear();
        _compoundToPathways.clear();
    };

    const exportStore = (): PathwayPilotStoreImport | undefined => {
        if (selectedPathway.value) {
            return { selectedPathwayId: selectedPathway.value.id };
        }
        return undefined;
    };

    const setImportedData = (storeImport: PathwayPilotStoreImport) => {
        if (storeImport.selectedPathwayId) {
            _pendingImportedPathwayId.value = storeImport.selectedPathwayId;
            // Set a stub immediately so the UI skips the generic spinner and goes
            // straight to PathwayVisualisationPanel (which has its own loading state).
            // The stub is replaced with real data at the end of initialize().
            selectedPathway.value = {
                id: storeImport.selectedPathwayId,
                name: '',
                category: '',
                subCategory: '',
                count: 0
            };
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
