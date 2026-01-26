import {defineStore} from "pinia";
import {computed, ref} from "vue";
import useSingleAnalysisStore, {
    SingleAnalysisStore, SingleAnalysisStoreImport,
    useSingleAnalysisStoreImport
} from "@/store/SingleAnalysisStore";
import {AnalysisConfig} from "@/store/AnalysisConfig";

const useGroupAnalysisStore = (
    groupId: string,
    groupName: string
) => defineStore(`multiSampleStore/${groupId}`, () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const id = ref<string>(groupId);
    const name = ref<string>(groupName);

    const _analyses = ref<Map<string, SingleAnalysisStore>>(new Map());

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const analyses = computed(() => Array.from(_analyses.value.values()));
    const empty = computed(() => _analyses.value.size === 0);

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const getAnalysis = (id: string): SingleAnalysisStore | undefined => {
        // @ts-ignore (unfortunately TypeScript is not able to correctly infer the type of the SingleAnalysisStore here)
        return _analyses.value.get(id);
    }

    const getFirstAnalysis = (): SingleAnalysisStore | undefined => {
        if (!empty.value) {
            // @ts-ignore (unfortunately TypeScript is not able to correctly infer the type of the SingleAnalysisStore here)
            return analyses.value[0];
        }
        return undefined;
    }

    const addAnalysis = (
        name: string, rawPeptides: string,
        config: AnalysisConfig,
        intensities?: Map<string, number>
    ): string => {
        const analysisId = crypto.randomUUID();
        _analyses.value.set(analysisId, useSingleAnalysisStore(analysisId, name, rawPeptides, config, intensities));
        return analysisId;
    }

    const removeAnalysis = (id: string): void => {
        _analyses.value.delete(id);
    }

    const clear = (): void => {
        _analyses.value.clear();
    }

    const updateName = (newName: string): void => {
        name.value = newName;
    }

    const exportStore = (): GroupAnalysisStoreImport => {
        return {
            id: id.value,
            name: name.value,
            analyses: Array.from(_analyses.value.values()).map(analysis => analysis.exportStore())
        };
    }

    const setImportedData = (storeImport: GroupAnalysisStoreImport) => {
        storeImport.analyses.forEach((analysisImport: SingleAnalysisStoreImport) => {
            const analysis = useSingleAnalysisStoreImport(analysisImport);
            _analyses.value.set(analysis.id, analysis);
        });
    }

    return {
        id,
        name,
        analyses,
        empty,

        getAnalysis,
        getFirstAnalysis,
        addAnalysis,
        removeAnalysis,
        clear,
        updateName,
        exportStore,
        setImportedData
    };
})();

export interface GroupAnalysisStoreImport {
    id: string;
    name: string;
    analyses: SingleAnalysisStoreImport[];
}

export const useGroupAnalysisStoreImport = (storeImport: GroupAnalysisStoreImport): GroupAnalysisStore => {
    const store = useGroupAnalysisStore(storeImport.id, storeImport.name);
    store.setImportedData(storeImport);
    return store;
}

export type GroupAnalysisStore = ReturnType<typeof useGroupAnalysisStore>;

export default useGroupAnalysisStore;
