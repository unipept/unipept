import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";
import useSingleAnalysisStore, {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";

let _singleAnalysisStoreId = 0;

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

    const getAnalysis = (name: string): SingleAnalysisStore | undefined => {
        return _analyses.value.get(name);
    }

    const addAnalysis = (name: string, rawPeptides: string, config: AnalysisConfig): void => {
        if (isValidNewAnalysis(name)) {
            _analyses.value.set(name, useSingleAnalysisStore(_singleAnalysisStoreId++, name, rawPeptides, config));
        }
    }

    const removeAnalysis = (name: string) => {
        _analyses.value.delete(name);
    }

    const isValidNewAnalysis = (name: string): boolean => {
        return !_analyses.value.has(name);
    }

    return {
        id,
        name,
        analyses,
        empty,

        getAnalysis,
        addAnalysis,
        removeAnalysis
    };
})();

export type MultiAnalysisStore = ReturnType<typeof useMultiAnalysisStore>;

export default useMultiAnalysisStore;
