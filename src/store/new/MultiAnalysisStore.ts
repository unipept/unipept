import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";
import useSingleAnalysisStore, {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {v4 as uuidv4} from "uuid";

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
        return _analyses.value.get(id);
    }

    const addAnalysis = (name: string, rawPeptides: string, config: AnalysisConfig): string => {
        const analysisId = uuidv4();
        _analyses.value.set(analysisId, useSingleAnalysisStore(analysisId, name, rawPeptides, config));
        return analysisId;
    }

    const removeAnalysis = (id: string) => {
        _analyses.value.delete(id);
    }

    const updateName = (newName: string) => {
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
        updateName
    };
})();

export type MultiAnalysisStore = ReturnType<typeof useMultiAnalysisStore>;

export default useMultiAnalysisStore;
