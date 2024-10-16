import {defineStore} from "pinia";
import useMultiAnalysisStore from "@/store/new/MultiAnalysisStore";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";

let _groupSampleStoreId = 0;

const useGroupAnalysisStore = defineStore('groupSampleStore', () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const groups = ref<any[]>([]);

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================


    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const addGroup = (name: string): number => {
        groups.value = [
            ...groups.value,
            useMultiAnalysisStore(_groupSampleStoreId++, name)
        ];

        return groups.value.length - 1;
    };

    const addAnalysis = (groupId: number, name: string, peptides: string[], config: AnalysisConfig): [number, number] => {
        groups.value = [ ...groups.value ];
        return [ groupId, groups.value[groupId].addAnalysis(name, peptides, config) ];
    };

    return {
        groups,
        addGroup,
        addAnalysis
    };
});

export type GroupAnalysisStore = ReturnType<typeof useGroupAnalysisStore>;

export default useGroupAnalysisStore;
