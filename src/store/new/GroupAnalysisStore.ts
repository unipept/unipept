import {defineStore} from "pinia";
import useMultiAnalysisStore, {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";
import {v4 as uuidv4} from "uuid";

const useGroupAnalysisStore = defineStore('_groupsampleStore', () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const _groups = ref<Map<string, MultiAnalysisStore>>(new Map());

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const groups = computed(() => Array.from(_groups.value.values()));

    const empty = computed(() => groups.value
        .values()
        .every(group => group.empty)
    )

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const getGroup = (id: string): MultiAnalysisStore | undefined => {
        return _groups.value.get(id);
    };

    const addGroup = (name: string): string => {
        const id = uuidv4();
        _groups.value.set(id, useMultiAnalysisStore(id, name));
        return id;
    };

    const removeGroup = (id: string): void => {
        _groups.value.delete(id);
    }

    const addAnalysis = (groupId: string, analysisName: string, peptides: string[], config: AnalysisConfig): void => {
        _groups.value.get(groupId)?.addAnalysis(analysisName, peptides, config);
    };

    const removeAnalysis = (groupId: string, analysisName: string): void => {
        _groups.value.get(groupId)?.removeAnalysis(analysisName);
    };

    return {
        groups,
        empty,

        getGroup,
        addGroup,
        removeGroup,
        addAnalysis,
        removeAnalysis
    };
});

export type GroupAnalysisStore = ReturnType<typeof useGroupAnalysisStore>;

export default useGroupAnalysisStore;
