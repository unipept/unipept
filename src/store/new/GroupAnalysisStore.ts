import {defineStore} from "pinia";
import useMultiAnalysisStore, {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";

let __groupsampleStoreId = 0;

const useGroupAnalysisStore = defineStore('_groupsampleStore', () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    // const _groups = ref<any[]>([]);

    const _groups = ref<Map<string, MultiAnalysisStore>>(new Map());

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const groups = computed(() => Array.from(_groups.value.values()));

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const getGroup = (name: string): MultiAnalysisStore | undefined => {
        return _groups.value.get(name);
    }

    const addGroup = (name: string): void => {
        if (isValidNewGroup(name)) {
            _groups.value.set(name, useMultiAnalysisStore(__groupsampleStoreId++, name));
        }
    };

    const removeGroup = (name: string): void => {
        _groups.value.delete(name);
    }

    const addAnalysis = (groupName: string, analysisName: string, peptides: string[], config: AnalysisConfig): void => {
        _groups.value.get(groupName)?.addAnalysis(analysisName, peptides, config);
    };

    const removeAnalysis = (groupName: string, analysisName: string): void => {
        _groups.value.get(groupName)?.removeAnalysis(analysisName);
    }

    const isValidNewGroup = (name: string): boolean => {
        return !_groups.value.has(name);
    }

    return {
        groups,

        getGroup,
        addGroup,
        removeGroup,
        addAnalysis,
        removeAnalysis
    };
});

export type GroupAnalysisStore = ReturnType<typeof useGroupAnalysisStore>;

export default useGroupAnalysisStore;
