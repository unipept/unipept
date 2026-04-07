import { ref } from "vue";
import { defineStore } from "pinia";
import PathwayPilotCommunicator, { CompoundInfo, EcInfo, PathwayInfo, PathwayVisualizationData } from "@/logic/communicators/PathwayPilotCommunicator";

const usePathwayPilotMappingStore = defineStore("pathwayPilotMappingStore", () => {
    const communicator = new PathwayPilotCommunicator();

    const pathwayMapping = ref<Map<string, PathwayInfo> | undefined>(undefined);
    const ecMapping = ref<Map<string, EcInfo> | undefined>(undefined);
    const compoundMapping = ref<Map<string, CompoundInfo> | undefined>(undefined);

    // Shared visualization cache: pathway ID → in-flight or resolved fetch promise.
    // Keyed by pathway ID so all analyses and the comparative view share one cache.
    const _pathwayData = new Map<string, Promise<PathwayVisualizationData>>();

    const getVisualizationData = (pathwayId: string): Promise<PathwayVisualizationData> => {
        if (!_pathwayData.has(pathwayId)) {
            const promise = communicator.fetchPathwayVisualization(pathwayId);
            promise.catch(() => _pathwayData.delete(pathwayId));
            _pathwayData.set(pathwayId, promise);
        }
        return _pathwayData.get(pathwayId)!;
    };

    const fetchMappings = async () => {
        if (pathwayMapping.value && ecMapping.value && compoundMapping.value) {
            return;
        }

        const [pathway, ec, compound] = await Promise.all([
            communicator.fetchPathwayMapping(),
            communicator.fetchEcMapping(),
            communicator.fetchCompoundMapping()
        ]);

        pathwayMapping.value = pathway;
        ecMapping.value = ec;
        compoundMapping.value = compound;
    };

    return { pathwayMapping, ecMapping, compoundMapping, fetchMappings, getVisualizationData };
});

export default usePathwayPilotMappingStore;
