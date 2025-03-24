import {defineStore} from "pinia";
import useMultiAnalysisStore, {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";
import {computed, ref} from "vue";
import {v4 as uuidv4} from "uuid";
import {AnalysisConfig} from "@/store/new/AnalysisConfig";
import useCustomFilterStore from "@/store/new/CustomFilterStore";

export const DEFAULT_NEW_GROUP_NAME = "Group";

const useGroupAnalysisStore = defineStore('_groupsampleStore', () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const _groups = ref<Map<string, MultiAnalysisStore>>(new Map());

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const groups = computed(() => Array.from(_groups.value.values()));

    const empty = computed(() => Array.from(groups.value.values()).every(group => group.empty));

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const getGroup = (id: string): MultiAnalysisStore => {
        const group = _groups.value.get(id);
        if (group === undefined) {
            throw new Error(`Group with id ${id} not found.`);
        }
        return group;
    };

    const getFirstGroup = (): MultiAnalysisStore | undefined => {
        return groups.value[0];
    }

    const getFirstNonEmptyGroup = (): MultiAnalysisStore | undefined => {
        return groups.value.find(group => !group.empty);
    }

    const addGroup = (name: string): string => {
        const id = uuidv4();
        _groups.value.set(id, useMultiAnalysisStore(id, name));
        return id;
    };

    const removeGroup = (id: string): void => {
        _groups.value.delete(id);
    }

    const addAnalysis = (groupId: string, analysisName: string, peptides: string, config: AnalysisConfig): void => {
        getGroup(groupId).addAnalysis(analysisName, peptides, config);
    };

    const removeAnalysis = (groupId: string, analysisName: string): void => {
       getGroup(groupId).removeAnalysis(analysisName);
    };

    const clear = () => {
        _groups.value.forEach(group => group.clear());
        _groups.value.clear();
    }

    /**
     * Returns a number for the default group naming, such that the new default group's name is unique.
     */
    const findFirstAvailableGroupNumber = () => {
        const existingGroupNames: string[] = [..._groups.value.values()].map(g => g.name);
        let counter = 1;
        while (existingGroupNames.includes(`${DEFAULT_NEW_GROUP_NAME} ${counter}`)) {
            counter += 1;
        }
        return counter;
    }

    return {
        groups,
        empty,

        getGroup,
        getFirstGroup,
        getFirstNonEmptyGroup,
        addGroup,
        removeGroup,
        addAnalysis,
        removeAnalysis,
        clear,
        findFirstAvailableGroupNumber
    };
});

export type GroupAnalysisStore = ReturnType<typeof useGroupAnalysisStore>;

export default useGroupAnalysisStore;
