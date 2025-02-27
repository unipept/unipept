import {defineStore} from "pinia";
import {computed, ref} from "vue";
import useSingleAnalysisStore, {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {v4 as uuidv4} from "uuid";
import {AnalysisConfig} from "@/store/new/AnalysisConfig";

const useMultiAnalysisStore = (
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

    const addAnalysis = (
        name: string, rawPeptides: string,
        config: AnalysisConfig,
        intensities?: Map<string, number>
    ): string => {
        const analysisId = uuidv4();
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

    return {
        id,
        name,
        analyses,
        empty,

        getAnalysis,
        addAnalysis,
        removeAnalysis,
        clear,
        updateName
    };
})();

export type MultiAnalysisStore = ReturnType<typeof useMultiAnalysisStore>;

export default useMultiAnalysisStore;
