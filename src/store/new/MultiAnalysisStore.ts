import {defineStore} from "pinia";
import {ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";

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

    const open = ref<boolean>(false);

    const analyses = ref<any[]>([]);

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const addAnalysis = (name: string, rawPeptides: string, config: AnalysisConfig) => {
        analyses.value = [
            ...analyses.value,
            useSingleAnalysisStore(_singleAnalysisStoreId++, name, rawPeptides, config)
        ];

        return analyses.value.length - 1;
    }

    return {
        id,
        name,
        open,
        analyses,

        addAnalysis
    };
})();

export type MultiAnalysisStore = ReturnType<typeof useMultiAnalysisStore>;

export default useMultiAnalysisStore;
