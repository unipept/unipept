import {defineStore} from "pinia";
import useGroupAnalysisStore, {
    GroupAnalysisStore,
    GroupAnalysisStoreImport,
    useGroupAnalysisStoreImport
} from "@/store/GroupAnalysisStore";
import {computed, ref} from "vue";
import {v4 as uuidv4} from "uuid";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useCustomFilterStore, {CustomFilterStoreImport, useCustomFilterStoreImport} from "@/store/CustomFilterStore";

export const DEFAULT_NEW_GROUP_NAME = "Group";

const useProjectAnalysisStore = defineStore('_groupsampleStore', () => {
    const customFilterStore = useCustomFilterStore();

    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const name = ref<string | undefined>(undefined);

    const _groups = ref<Map<string, GroupAnalysisStore>>(new Map());

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const groups = computed(() => Array.from(_groups.value.values()));

    const empty = computed(() => Array.from(groups.value.values()).every(group => group.empty));

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const setName = (newName: string): void => {
        name.value = newName;
    }

    const getGroup = (id: string): GroupAnalysisStore => {
        const group = _groups.value.get(id);
        if (group === undefined) {
            throw new Error(`Group with id ${id} not found.`);
        }
        return group;
    };

    const getFirstGroup = (): GroupAnalysisStore | undefined => {
        return groups.value[0];
    }

    const getFirstNonEmptyGroup = (): GroupAnalysisStore | undefined => {
        return groups.value.find(group => !group.empty);
    }

    const addGroup = (name: string): string => {
        const id = uuidv4();
        _groups.value.set(id, useGroupAnalysisStore(id, name));
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
        customFilterStore.clear();
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

    const exportStore = (): ProjectAnalysisStoreImport => {
        return {
            groups: Array.from(_groups.value.values()).map(group => group.exportStore()),
            filters: customFilterStore.exportStore(),
            version: APP_VERSION
        };
    }

    const setImportedData = (storeImport: ProjectAnalysisStoreImport) => {
        clear();
        useCustomFilterStoreImport(storeImport.filters);
        for (const group of storeImport.groups) {
            const groupStore = useGroupAnalysisStoreImport(group);
            _groups.value.set(group.id, groupStore);
        }
    }

    return {
        name,
        groups,
        empty,

        setName,
        getGroup,
        getFirstGroup,
        getFirstNonEmptyGroup,
        addGroup,
        removeGroup,
        addAnalysis,
        removeAnalysis,
        clear,
        findFirstAvailableGroupNumber,
        exportStore,
        setImportedData
    };
});

export interface ProjectAnalysisStoreImport {
    groups: GroupAnalysisStoreImport[];
    filters: CustomFilterStoreImport;
    version: string;
}

export const useProjectAnalysisStoreImport = (storeImport: ProjectAnalysisStoreImport): void => {
    const groupStore = useProjectAnalysisStore();
    groupStore.setImportedData(storeImport);
}

export type ProjectAnalysisStore = ReturnType<typeof useProjectAnalysisStore>;

export default useProjectAnalysisStore;
